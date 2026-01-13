const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
  try {
    // Check verification level
    const user = await require('../models/User').findById(req.user._id); // Assuming we need fresh data or req.user is enough
    
    // If we trust req.user populated by authMiddleware (which usually doesn't have deep nested new fields unless updated), 
    // it's safer to fetch or ensure middleware populates it. 
    // Mongoose models usually don't auto-update req.user in memory if DB changes elsewhere, but here it's per request.
    // Let's assume req.user might not have employerVerification if it's a new field and token isn't refreshed.
    // Safe bet: fetch user.
    
    if (user.employerVerification.level < 1) {
        // Option 1: Block entirely
        // return res.status(403).json({ message: 'You must verify your company identity (Level 1) to post jobs.' });
        
        // Option 2: Allow but set to Draft/Hidden (As per user request "Cannot publish jobs publicly")
        // We'll set status to 'Closed' or a new 'Draft' status if we had one. 
        // User request says "Create profile, Post drafts". 
        // So let's force status to 'Closed' if they try to set 'Active'
        if (req.body.status !== 'Closed') {
             return res.status(403).json({ message: 'Unverified employers can only post Drafts (Closed jobs). Please verify your identity to publish active jobs.' });
        }
    }

    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all jobs with search and filters
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const { 
      search, 
      type, 
      location, 
      salaryMin, 
      salaryMax, 
      experience 
    } = req.query;

    const query = { status: 'Active' };

    // Search functionality (Title or Company or Skills)
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Filter by Employer (postedBy)
    if (req.query.postedBy) {
        query.postedBy = req.query.postedBy;
    }

    // Filter by Job Type
    if (type) {
        // If type is comma-separated list
        const types = type.split(',').map(t => new RegExp(t.trim(), 'i'));
        query.type = { $in: types };
    }

    // Filter by Location
    if (location) {
       query.location = { $regex: location, $options: 'i' };
    }

    // Filter by Salary Range
    if (salaryMin) {
      query.salaryMin = { ...query.salaryMin, $gte: Number(salaryMin) };
    }
    if (salaryMax) {
      query.salaryMax = { ...query.salaryMax, $lte: Number(salaryMax) };
    }

    // Filter by Experience Level
    // Handling textual experience levels mapping to numbers if needed, 
    // or just direct matching if stored as string. 
    // The model says experienceMin/Max are Numbers, but UI sends "Entry Level" etc.
    // We need to map UI "Entry Level" to number ranges or change how we query.
    // For now, let's assume the frontend sends simple values or we implement a mapping here.
    // Assuming frontend sends numeric ranges or we just ignore for a sec.
    // Actually, let's just implement exact match for experienceMin for now if passed, 
    // or a range if 'experience' param is passed as a string like "Entry Level".
    
    // Mapping for common levels to years (Approximation)
    if (experience) {
        const expMap = {
            'Entry Level': { min: 0, max: 2 },
            'Mid Level': { min: 2, max: 5 },
            'Senior Level': { min: 5, max: 10 },
            'Executive': { min: 10, max: 50 }
        };
        const range = expMap[experience] || expMap[Object.keys(expMap).find(k => k.toLowerCase() === experience.toLowerCase())];
        
        if (range) {
             query.experienceMin = { $lte: range.max };
             query.experienceMax = { $gte: range.min };
        }
    }

    // Sorting
    let sort = { createdAt: -1 }; // Default: Newest
    const { sort: sortOption } = req.query;

    if (sortOption) {
        if (sortOption === 'salary_high') {
            sort = { salaryMax: -1 };
        } else if (sortOption === 'salary_low') {
            sort = { salaryMin: 1 };
        } else if (sortOption === 'relevance' && search) {
            // If sort is relevance and there is a search term, we rely on Mongo's text score if using text search.
            // But we are using regex. So standard relevance is hard. 
            // We'll fallback to Newest for now, or maybe title match? 
            // Let's just keep it as newest for regex search fallback.
            sort = { createdAt: -1 };
        } else if (sortOption === 'oldest') {
             sort = { createdAt: 1 };
        }
    }

    const jobs = await Job.find(query).sort(sort).populate('postedBy', 'name email profilePicture employerVerification');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name email profilePicture');

  if (job) {
    const applicantCount = await Application.countDocuments({ job: job._id });
    res.json({ ...job._doc, applicantCount });
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
};

// @desc    Get jobs by logged in employer
// @route   GET /api/jobs/myjobs
// @access  Private (Employer only)
const getMyJobs = async (req, res) => {
  try {
      const jobs = await Job.aggregate([
          { $match: { postedBy: req.user._id } },
          {
              $lookup: {
                  from: 'applications',
                  localField: '_id',
                  foreignField: 'job',
                  as: 'applications'
              }
          },
          {
              $addFields: {
                  applicationCount: { $size: '$applications' }
              }
          },
          {
              $project: {
                  applications: 0 // Remove the applications array to keep payload light
              }
          },
          { $sort: { createdAt: -1 } }
      ]);
      res.json(jobs);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Employer only)
const updateJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    const fieldsToUpdate = [
      'title', 'company', 'location', 'type', 'salaryMin', 'salaryMax', 
      'salaryType', 'salaryFrequency', 'experienceMin', 'experienceMax', 
      'description', 'status', 'skills', 'companyDescription', 'jobRole', 
      'functionalArea', 'education', 'fieldOfStudy', 'benefits', 
      'preScreeningQuestions', 'recruitmentDuration', 'applyMethod', 
      'applyUrl', 'interviewTime', 'interviewVenue', 'interviewContact', 'openings'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    const updatedJob = await job.save();
    res.json(updatedJob);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
const deleteJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
};

// @desc    Get stats for employer
// @route   GET /api/jobs/stats
// @access  Private (Employer)
const getEmployerStats = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user._id });
        const jobIds = jobs.map(job => job._id);

        const activeJobs = jobs.filter(job => job.status === 'Active').length;
        const closedJobs = jobs.filter(job => job.status === 'Closed').length;
        
        const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
        
        res.json({
            totalJobs: jobs.length,
            activeJobs,
            closedJobs,
            totalApplications
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get recommended jobs for user
// @route   GET /api/jobs/recommendations
// @access  Private
const getRecommendedJobs = async (req, res) => {
    try {
        // We assume req.user is populated by protect middleware, but we need full user details including skills
        // Or we can rely on req.user if we updated the middleware to select everything. 
        // Let's fetch cleanly to be sure.
        const User = require('../models/User'); // Ensure Model is imported
        const user = await User.findById(req.user._id);

        if (!user || !user.skills || user.skills.length === 0) {
            // Fallback to recent jobs if no skills
             const jobs = await Job.find({ status: 'Open' }).sort({ createdAt: -1 }).limit(5);
             return res.json(jobs);
        }

        const jobs = await Job.find({
            status: 'Open',
            $or: [
                { skills: { $in: user.skills } },
                { title: { $regex: user.skills.join('|'), $options: 'i' } } // Naive match title with any skill
            ]
        }).limit(10);

        res.json(jobs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get related jobs
// @route   GET /api/jobs/:id/related
// @access  Public
const getRelatedJobs = async (req, res) => {
    try {
        const currentJob = await Job.findById(req.params.id);
        if (!currentJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const relatedJobs = await Job.find({
            _id: { $ne: currentJob._id },
            status: 'Active',
            $or: [
                { jobRole: currentJob.jobRole },
                { title: { $regex: currentJob.title.split(' ')[0], $options: 'i' } }, // Simple match first word
                { skills: { $in: currentJob.skills } }
            ]
        }).limit(5);

        res.json(relatedJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  getEmployerStats,
  getRecommendedJobs,
  getRelatedJobs
};
