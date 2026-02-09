const Application = require('../models/Application');
const Job = require('../models/Job');
const sendEmail = require('../utils/sendEmail');
const { getApplicationSuccessEmail, getApplicationStatusChangeEmail } = require('../utils/emailTemplates');
const { logActivity } = require('./activityLogController');

// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Candidate only)
// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Candidate only)
const applyToJob = async (req, res) => {
  const { jobId, coverLetter, resume, screeningAnswers, agreedToTerms } = req.body;
  // Note: 'resume' is now expected to be a URL string from the profile selection if provided in body.
  // If file upload is still supported, we might check req.file.path. 
  // For this refactor, we prioritize the selected resume URL.

  const resumeUrl = resume || (req.file ? req.file.path : null);

  try {
    if (!resumeUrl) {
        return res.status(400).json({ message: 'Please select or upload a resume' });
    }

    if (agreedToTerms !== true) {
        return res.status(400).json({ message: 'You must agree to the terms and conditions' });
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
      companyId: job.companyId,
      resume: resumeUrl,
      coverLetter,
      screeningAnswers: screeningAnswers || [],
      agreedToTerms
    });

    // Notify Employer
    const Notification = require('../models/Notification');
    await Notification.create({
        recipient: job.postedBy, // Assuming postedBy is the Recruiter/Owner
        sender: req.user._id,
        type: 'NEW_APPLICATION',
        message: `${req.user.name} applied for ${job.title}`,
        relatedId: application._id,
        relatedModel: 'Application'
    });

    // Real-time Push Notification
    if (req.io) {
        req.io.to(job.postedBy.toString()).emit('notification', {
            message: `${req.user.name} applied for ${job.title}`,
            type: 'NEW_APPLICATION'
        });
    }

    res.status(201).json(application);

    // Send confirmation email to candidate
    try {
        const emailContent = getApplicationSuccessEmail(req.user, job);
        await sendEmail({
            email: req.user.email,
            subject: `Application Received: ${job.title}`,
            html: emailContent
        });
    } catch (emailError) {
        console.error('Error sending application success email:', emailError);
        // We don't fail the request if email fails, just log it
    }
  } catch (error) {
    res.status(400).json({ message: 'Application failed: ' + error.message });
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = async (req, res) => {
  try {
    const jobData = await Job.findById(req.params.jobId);
    
    // Security Check: Ensure requester belongs to the same company as the job
    // Ideally this check should be done, but for simplicity we rely on route params.
    // However, stronger security would fetch the job first and check postedBy.
    // We already populate req.user in middleware
    
    if (!jobData) {
         return res.status(404).json({ message: 'Job not found' });
    }

    const { ats } = req.query;

    const isOwner = jobData.postedBy.toString() === req.user._id.toString();
    const isCompanyMember = req.user.companyId && jobData.companyId && jobData.companyId.toString() === req.user.companyId.toString();
    
    if (!isOwner && !isCompanyMember) {
        return res.status(401).json({ message: 'Not authorized to view these applications' });
    }

    let applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email skills totalExperience experience') // Added skills and experience for scoring
      .sort({ createdAt: -1 });

    if (ats === 'true') {
        const jobSkills = jobData.skills || [];
        // Map experience level from string to number if needed, or rely on jobData.experienceMin
        const minExp = jobData.experienceMin || 0;

        applications = applications.map(app => {
            const applicant = app.applicant;
            if (!applicant) return { ...app.toObject(), matchScore: 0 };

            let score = 0;
            const reasons = [];

            // 1. Skill Match (Weight: 60%)
            // Assuming applicant.skills is an array of strings
            const applicantSkills = applicant.skills || [];
            if (jobSkills.length > 0) {
                const matchedSkills = jobSkills.filter(skill => 
                    applicantSkills.some(as => as.toLowerCase().includes(skill.toLowerCase()))
                );
                const skillMatchRatio = matchedSkills.length / jobSkills.length;
                score += skillMatchRatio * 60;
                if (matchedSkills.length > 0) reasons.push(`${matchedSkills.length}/${jobSkills.length} Skills Matched`);
            }

            // 2. Experience Match (Weight: 40%)
            const applicantExp = applicant.totalExperience || 0;
            if (applicantExp >= minExp) {
                score += 40;
                reasons.push(`Experience Met (${applicantExp} Years)`);
            } else {
                // Partial score for experience? 
                // Let's say max score if >= minExp.
                // If minExp is 2 and applicant has 1, score = (1/2) * 40
                if (minExp > 0) {
                     const expRatio = applicantExp / minExp;
                     score += expRatio * 40;
                }
            }

            return { ...app.toObject(), matchScore: Math.round(score), matchReasons: reasons };
        });

        // Sort by matchScore descending
        applications.sort((a, b) => b.matchScore - a.matchScore);
    }

    res.json(applications);
  } catch (error) {
    console.error(error);
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

    // Verify ownership or company membership
    const isOwner = application.employer.toString() === req.user._id.toString();
    const isCompanyMember = req.user.companyId && application.companyId && application.companyId.toString() === req.user.companyId.toString();

    if (!isOwner && !isCompanyMember) {
      return res.status(401).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    const updatedApplication = await application.save();

    // Send response immediately to unblock UI
    res.json(updatedApplication);

    // Perform background tasks (Email & Notifications) asynchronously
    (async () => {
        try {
            await logActivity(req.user, 'APPLICANT_STATUS_CHANGE', `Application status changed to ${status}`, application._id, 'Application');

            // Notify Applicant
            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: application.applicant,
                sender: req.user._id,
                type: 'APPLICATION_STATUS_UPDATE',
                message: `Your application for ${application.job ? (await Job.findById(application.job)).title : 'Job'} at ${application.companyId ? (await require('../models/Company').findById(application.companyId))?.name : 'Company'} has been ${status}`,
                relatedId: application.job, // Linking to Job ID for redirection
                relatedModel: 'Job'
            });

            // Real-time Push Notification
            if (req.io) {
                req.io.to(application.applicant.toString()).emit('notification', {
                    message: `Your application status has been updated to ${status}`,
                    type: 'APPLICATION_STATUS_UPDATE',
                    relatedId: application.job
                });
            }

            // Send status update email to candidate
            // We need to populate applicant to get email/name if not already populated
            // typically finding by ID doesn't populate unless we ask
            const appWithUser = await Application.findById(application._id).populate('applicant', 'name email');
            
            if (appWithUser && appWithUser.applicant) {
                const emailContent = getApplicationStatusChangeEmail(appWithUser.applicant, {
                    title: application.job ? (await Job.findById(application.job)).title : 'Job',
                    company: application.companyId ? (await require('../models/Company').findById(application.companyId))?.name : 'Company' 
                    // Note: Ideally job and company details should be populated or fetched more efficiently.
                    // Let's optimize by populating job in the initial find or here.
                }, status);

                // Re-fetching robustly for email details
                const robustApp = await Application.findById(application._id)
                    .populate('applicant', 'name email')
                    .populate('job', 'title company')
                    .populate('companyId', 'name'); // Assuming companyId ref exists or we get it from job
                
                // Fallback for company name if companyId populate fails or isn't set
                const companyName = robustApp.companyId?.name || robustApp.job?.company || 'The Company';

                const robustEmailContent = getApplicationStatusChangeEmail(robustApp.applicant, {
                        title: robustApp.job?.title || 'Job Position',
                        company: companyName
                }, status);


                await sendEmail({
                    email: robustApp.applicant.email,
                    subject: `Application Status Update: ${robustApp.job?.title}`,
                    html: robustEmailContent
                });
            }
        } catch (backgroundError) {
            console.error('Error in background status update tasks:', backgroundError);
            // Check if headers are sent (should be, given res.json above)
            // We just log because client already got success response
        }
    })();
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};



// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Employer only)
const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('applicant', 'name email mobile profilePicture')
            .populate('job', 'title');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Verify ownership or company membership
        const isOwner = application.employer.toString() === req.user._id.toString();
        const isCompanyMember = req.user.companyId && application.companyId && application.companyId.toString() === req.user.companyId.toString();

        if (!isOwner && !isCompanyMember) {
            return res.status(401).json({ message: 'Not authorized to view this application' });
        }

        res.json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  applyToJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  getApplicationById,
};
