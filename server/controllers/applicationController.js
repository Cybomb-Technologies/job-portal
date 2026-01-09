const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Candidate only)
// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Candidate only)
const applyToJob = async (req, res) => {
  const { jobId, coverLetter, resume, screeningAnswers } = req.body;
  // Note: 'resume' is now expected to be a URL string from the profile selection if provided in body.
  // If file upload is still supported, we might check req.file.path. 
  // For this refactor, we prioritize the selected resume URL.

  const resumeUrl = resume || (req.file ? req.file.path : null);

  try {
    if (!resumeUrl) {
        return res.status(400).json({ message: 'Please select or upload a resume' });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Validate screening answers if job has questions
    if (job.preScreeningQuestions && job.preScreeningQuestions.length > 0) {
        if (!screeningAnswers || screeningAnswers.length !== job.preScreeningQuestions.length) {
             return res.status(400).json({ message: 'Please answer all pre-screening questions' });
        }
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      employer: job.postedBy,
      resume: resumeUrl,
      coverLetter,
      screeningAnswers: screeningAnswers || []
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: 'Application failed: ' + error.message });
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = async (req, res) => {
  try {
    const application = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });

    // Check if the user requesting is the employer who posted the job
    // Ideally this check should be done, but for simplicity we rely on route params.
    // However, stronger security would fetch the job first and check postedBy.
    
    // Security Check: Ensure the requester is indeed the employer of this job
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to view these applications' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all applications by logged in candidate
// @route   GET /api/applications/my-applications
// @access  Private (Candidate only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location status')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify ownership
    if (application.employer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    const updatedApplication = await application.save();

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  applyToJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
};
