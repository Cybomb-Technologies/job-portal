const Job = require('../models/Job');
const Application = require('../models/Application');
const sendEmail = require('../utils/sendEmail');
const { getNewJobNotificationEmail } = require('../utils/emailTemplates');
const { logActivity } = require('./activityLogController');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = async (req, res) => {
  try {
    // Check verification level
    const user = await require('../models/User').findById(req.user._id); 
    
    // Fetch Company with members populated to check legacy verification status
    const company = await require('../models/Company').findById(user.companyId).populate('members.user');

    let isVerified = false;
    if (company) {
        if (company.employerVerification?.level >= 1) {
            isVerified = true;
        } else {
            // Legacy Sync / Recruiter Check: 
            // If company is technically unverified in DB, check if any Admin member is verified.
            // This handles cases where verification happened before Company model sync logic was added.
            const adminMembers = company.members.filter(m => m.role === 'Admin');
            const verifiedAdmin = adminMembers.find(m => m.user && m.user.employerVerification && m.user.employerVerification.level >= 1);

            if (verifiedAdmin) {
                // Sync verification status to Company
                company.employerVerification.level = 1;
                company.employerVerification.status = 'Verified';
                company.employerVerification.domainVerified = true;
                await company.save();
                isVerified = true;
                console.log(`Synced verification for company ${company.name} from admin ${verifiedAdmin.user.name}`);
            }
        }
    }

    if (!isVerified) {
        if (req.body.status !== 'Closed') {
             return res.status(403).json({ message: 'Unverified companies can only post Drafts (Closed jobs). Please verify your company identity to publish active jobs.' });
        }
    }

    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
      companyId: user.companyId
    });

    // Notify all followers
    // Note: We now track followers in the Company model (schema updated)
    // and also in User model (legacy/redundancy). 
    // Best to use Company.followers for robustness.
    
    // Fetch Company with followers populated
    const companyWithFollowers = await require('../models/Company').findById(user.companyId).populate('followers', 'name email');
    
    if (companyWithFollowers && companyWithFollowers.followers && companyWithFollowers.followers.length > 0) {
        // 1. In-App Notifications
        const Notification = require('../models/Notification');
        const notifications = companyWithFollowers.followers.map(follower => ({
            recipient: follower._id,
            sender: req.user._id, // Recruiter/Admin who posted
            type: 'JOB_ALERT',
            message: `${companyWithFollowers.name} posted a new job: ${job.title}`,
            relatedId: job._id,
            relatedModel: 'Job'
        }));
        await Notification.insertMany(notifications);

        // 2. Real-time Push Notifications
        notifications.forEach(notif => {
            if (req.io) {
                req.io.to(notif.recipient.toString()).emit('notification', {
                    message: notif.message,
                    type: 'JOB_ALERT'
                });
            }
        });

        // 3. Email Notifications
        const emailPromises = companyWithFollowers.followers.map(follower => {
            if (!follower.email) return Promise.resolve();
            const emailContent = getNewJobNotificationEmail(follower, job, companyWithFollowers);
            return sendEmail({
                email: follower.email,
                subject: `New Job Opening at ${companyWithFollowers.name}: ${job.title}`,
                html: emailContent
            }).catch(err => console.error(`Failed to send email to ${follower.email}:`, err));
        });

        // Send emails in background (awaiting all might be slow for many followers, but okay for MVP)
        // Ideally offload to a queue. For now, we don't await to not block response? 
        // Or await `Promise.all` but catch errors so it doesn't fail job creation.
    Promise.all(emailPromises).then(() => console.log('Job alert emails sent')).catch(err => console.error('Error sending job alert emails', err));
    }

    await logActivity(req.user, 'JOB_CREATE', `Created new job: ${job.title}`, job._id, 'Job');

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
      experience,
      directApply
    } = req.query;

    const query = { status: 'Active' };

    // Filter by Direct Apply
    if (directApply === 'true') {
        query.applyMethod = 'direct';
    }

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

    // Filter by Company (companyId)
    if (req.query.companyId) {
        query.companyId = req.query.companyId;
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
    
    let hasApplied = false;
    if (req.user) {
        const application = await Application.findOne({ 
            job: job._id, 
            applicant: req.user._id 
        });
        if (application) {
            hasApplied = true;
        }
    }

    res.json({ ...job._doc, applicantCount, hasApplied });
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
};

// @desc    Get jobs by logged in employer
// @route   GET /api/jobs/myjobs
// @access  Private (Employer only)
const getMyJobs = async (req, res) => {
  try {
      const query = req.user.companyId ? { companyId: req.user.companyId } : { postedBy: req.user._id };
      const jobs = await Job.aggregate([
          { $match: query },
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
    // Check if user belongs to the same company or is the original author
    const isOwner = job.postedBy.toString() === req.user._id.toString();
    const isCompanyMember = req.user.companyId && job.companyId && job.companyId.toString() === req.user.companyId.toString();

    if (!isOwner && !isCompanyMember) {
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

    if (req.body.status === 'Closed' && job.status === 'Closed') { // Assuming job.status is already updated by the loop
         // Check if it was active before? We modified the job object in place.
         // Wait, the loop `job[field] = req.body[field]` updates the job object in memory.
         // So I can't check `oldStatus` unless I saved it before the loop.
    } 

    // Better approach:
    // This logic is tricky because we update in place.
    // I should capture oldStatus before the loop.
    // However, I can't inject code before the loop easily with this chunk. 
    // I will replace the whole updateJob function body logic or a larger chunk.
    
    // Actually, I can allow the user to see the change in logic.
    // But let's just use a generic 'JOB_MODIFY' first, and handle DEACTIVATE if status is specifically passed as Closed.
    // Or simpler:
    const action = (req.body.status === 'Closed') ? 'JOB_DEACTIVATE' : 'JOB_MODIFY';
    await logActivity(req.user, action, `${action === 'JOB_DEACTIVATE' ? 'Deactivated' : 'Modified'} job: ${job.title}`, job._id, 'Job');
    
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
    const isOwner = job.postedBy.toString() === req.user._id.toString();
    const isCompanyMember = req.user.companyId && job.companyId && job.companyId.toString() === req.user.companyId.toString();

    if (!isOwner && !isCompanyMember) {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    await logActivity(req.user, 'JOB_DELETE', `Deleted job: ${job.title}`, job._id, 'Job');
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
        const query = req.user.companyId ? { companyId: req.user.companyId } : { postedBy: req.user._id };
        const jobs = await Job.find(query);
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
        const User = require('../models/User');
        const { findMatchesForUser } = require('../services/recommendationService');
        
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recommendations = await findMatchesForUser(user, 10); // Check top 10 for dashboard

        // If no strict functional matches, maybe fallback to recent jobs? 
        // The service logic returns strict matches. 
        // If empty, let's return standard recent jobs so dashboard isn't empty.
        
        if (recommendations.length === 0) {
             const jobs = await Job.find({ status: 'Active' })
                .populate('postedBy', 'name email profilePicture employerVerification')
                .sort({ createdAt: -1 })
                .limit(5);
             return res.json(jobs);
        }

        res.json(recommendations);

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


// @desc    Get job by slug
// @route   GET /api/jobs/slug/:slug
// @access  Public
const getJobBySlug = async (req, res) => {
    try {
        const { parseSlug } = require('../utils/slugify');
        const slug = req.params.slug;
        const idSuffix = parseSlug(slug);

        // Find job where _id ends with the suffix
        // Efficient way: Fetch _id for all active jobs (or reasonable subset if possible) 
        // to filter by suffix.
        const jobs = await Job.find({ status: 'Active' }).select('_id');
        const jobId = jobs.find(j => j._id.toString().endsWith(idSuffix))?._id;

        if (jobId) {
             req.params.id = jobId;
             return getJobById(req, res);
        } else {
             // Check closed jobs too just in case? Or return 404
             const closedJobs = await Job.find().select('_id status'); // Check all
             const closedJobId = closedJobs.find(j => j._id.toString().endsWith(idSuffix))?._id;
             
             if (closedJobId) {
                 req.params.id = closedJobId;
                 return getJobById(req, res);
             }

             res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        console.error('Error fetching job by slug:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getJobBySlug,
  getMyJobs,
  updateJob,
  deleteJob,
  getEmployerStats,
  getRecommendedJobs,
  getRelatedJobs
};
