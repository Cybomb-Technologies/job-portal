const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
  try {
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

    const jobs = await Job.find(query).sort(sort);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name email');

  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
};

// @desc    Get jobs by logged in employer
// @route   GET /api/jobs/myjobs
// @access  Private (Employer only)
const getMyJobs = async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json(jobs);
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

    job.title = req.body.title || job.title;
    job.company = req.body.company || job.company;
    job.location = req.body.location || job.location;
    job.type = req.body.type || job.type;
    job.salaryMin = req.body.salaryMin || job.salaryMin;
    job.salaryMax = req.body.salaryMax || job.salaryMax;
    job.experienceMin = req.body.experienceMin || job.experienceMin;
    job.experienceMax = req.body.experienceMax || job.experienceMax;
    job.description = req.body.description || job.description;
    job.skills = req.body.skills || job.skills;
    job.companyDescription = req.body.companyDescription || job.companyDescription;
    job.jobRole = req.body.jobRole || job.jobRole;
    job.functionalArea = req.body.functionalArea || job.functionalArea;
    job.education = req.body.education || job.education;
    job.benefits = req.body.benefits || job.benefits;
    job.preScreeningQuestions = req.body.preScreeningQuestions || job.preScreeningQuestions;
    job.status = req.body.status || job.status;

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

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
  getEmployerStats,
  getRecommendedJobs
};
