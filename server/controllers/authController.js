const User = require('../models/User');
const Job = require('../models/Job');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth user & get token (Login)
const authUser = async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.role !== role) {
      return res.status(401).json({ 
        message: `Please login as a ${user.role}. You cannot login as ${role}.` 
      });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyRole: user.companyRole,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, role });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyRole: user.companyRole,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Google Login
const googleLogin = async (req, res) => {
  const { token, role } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture, sub } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (user) {
       if(!user.googleId) {
            user.googleId = sub;
            await user.save();
        }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyRole: user.companyRole,
        token: generateToken(user._id),
      });
    } else {
      if (!role) {
        return res.status(400).json({ message: 'Role is required for new users' });
      }
      user = await User.create({
        name,
        email,
        googleId: sub,
        role,
        profilePicture: picture,
      });
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyRole: user.companyRole,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const message = `
    <h1>You have requested a password reset</h1>
    <p>Please go to this link to reset your password:</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: `Reset Link: ${resetUrl}`, // plain text fallback
      html: message,
    });

    res.status(200).json({ success: true, data: 'Email Sent' });
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ message: 'Email could not be sent' });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid Token' });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
  });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    let responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      about: user.about,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      certifications: user.certifications,
      currentLocation: user.currentLocation,
      preferredLocations: user.preferredLocations,
      resume: user.resume,
      resumes: user.resumes,
      profilePicture: user.profilePicture,
      bannerPicture: user.bannerPicture,
      companyId: user.companyId,
      companyRole: user.companyRole,
      totalExperience: user.totalExperience,
      following: user.following,
      followers: user.followers
    };

    if (user.companyId) {
        const company = await Company.findById(user.companyId);
        if (company) {
            responseData = {
                ...responseData,
                companyName: company.name,
                website: company.website,
                companyEmail: company.companyEmail,
                companyLocation: company.companyLocation,
                companyCategory: company.companyCategory,
                companyType: company.companyType,
                foundedYear: company.foundedYear,
                employeeCount: company.employeeCount,
                about: company.about, // Company about
                profilePicture: company.profilePicture, // Company Logo
                bannerPicture: company.bannerPicture,
                whyJoinUs: company.whyJoinUs,
                employerVerification: company.employerVerification
            };
        }
    } else {
        // Fallback for non-team users or job seekers
        responseData = {
            ...responseData,
            companyName: user.companyName,
            website: user.website,
            companyEmail: user.companyEmail,
            companyLocation: user.companyLocation,
            companyCategory: user.companyCategory,
            companyType: user.companyType,
            foundedYear: user.foundedYear,
            employeeCount: user.employeeCount,
            whyJoinUs: user.whyJoinUs,
            employerVerification: user.employerVerification
        };
    }

    res.json(responseData);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // 1. Update Personal Info (Always)
    user.name = req.body.name || user.name;
    user.title = req.body.title || user.title;
    user.about = req.body.about || user.about; // Personal bio
    user.currentLocation = req.body.currentLocation || user.currentLocation;
    
    if (req.body.totalExperience !== undefined) {
        user.totalExperience = Number(req.body.totalExperience);
    }

    // Handle structured personal data
    if (req.body.skills) {
      user.skills = typeof req.body.skills === 'string' 
        ? req.body.skills.split(',').map(s => s.trim()) 
        : req.body.skills;
    }

    if (req.body.experience) {
        try {
            user.experience = typeof req.body.experience === 'string' ? JSON.parse(req.body.experience) : req.body.experience;
        } catch (e) { user.experience = [{ description: req.body.experience }]; }
    }

    if (req.body.education) {
        try {
            user.education = typeof req.body.education === 'string' ? JSON.parse(req.body.education) : req.body.education;
        } catch (e) { user.education = [{ degree: req.body.education }]; }
    }

    if (req.body.certifications) {
        try {
            user.certifications = typeof req.body.certifications === 'string' ? JSON.parse(req.body.certifications) : req.body.certifications;
        } catch (e) { console.error("Error parsing certifications", e); }
    }

    if (req.body.preferredLocations) {
        try {
            user.preferredLocations = typeof req.body.preferredLocations === 'string' ? JSON.parse(req.body.preferredLocations) : req.body.preferredLocations;
        } catch (e) { user.preferredLocations = [req.body.preferredLocations]; }
    }

    // Handle Personal Files (Avatars, Resumes, Banners)
    if (req.files) {
        if (req.files.profilePicture && user.role !== 'Employer') {
            user.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
        }
        if (req.files.bannerPicture && user.role !== 'Employer') {
             user.bannerPicture = `/uploads/${req.files.bannerPicture[0].filename}`;
        }
        if (req.files.resume) {
            if (user.resumes.length >= 3) return res.status(400).json({ message: 'Maximum 3 resumes allowed.' });
            const path = `/uploads/${req.files.resume[0].filename}`;
            user.resumes.push({ name: req.files.resume[0].originalname, file: path, uploadedAt: new Date() });
            user.resume = path;
        }
    }

    // Handle Resumes (Delete/Set Active)
    if (req.body.activeResumeId) {
        const target = user.resumes.id(req.body.activeResumeId);
        if (target) user.resume = target.file;
    }
    if (req.body.deleteResumeId) {
        const resumeToDelete = user.resumes.id(req.body.deleteResumeId);
        if (resumeToDelete) {
            user.resumes.pull(req.body.deleteResumeId);
            if (user.resume === resumeToDelete.file) {
                user.resume = user.resumes.length > 0 ? user.resumes[user.resumes.length - 1].file : undefined;
            }
        }
    }

    // 2. Update Company Info (Only for Admin role)
    let company = null;
    if (user.role === 'Employer' && user.companyId) {
        company = await Company.findById(user.companyId);
        if (company) {
            // Only update company fields if user is Admin
            if (user.companyRole === 'Admin') {
                company.name = req.body.companyName || company.name;
                company.website = req.body.website ? req.body.website.toLowerCase() : company.website;
                company.companyEmail = req.body.companyEmail || company.companyEmail;
                company.companyLocation = req.body.companyLocation || company.companyLocation;
                company.companyCategory = req.body.companyCategory || company.companyCategory;
                company.companyType = req.body.companyType || company.companyType;
                company.foundedYear = req.body.foundedYear || company.foundedYear;
                company.employeeCount = req.body.employeeCount || company.employeeCount;
                company.about = req.body.about || company.about; // Company bio

                if (req.body.whyJoinUs) {
                    try {
                        company.whyJoinUs = typeof req.body.whyJoinUs === 'string' ? JSON.parse(req.body.whyJoinUs) : req.body.whyJoinUs;
                    } catch (e) { console.error("Error parsing whyJoinUs", e); }
                }

                // Handle Company Files
                if (req.files) {
                    if (req.files.profilePicture) {
                        company.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
                    }
                    if (req.files.bannerPicture) {
                        company.bannerPicture = `/uploads/${req.files.bannerPicture[0].filename}`;
                    }
                }

                await company.save();
            }
        }
    } else if (user.role === 'Employer' && !user.companyId) {
        // Fallback for legacy employers not yet migrated
        user.companyName = req.body.companyName || user.companyName;
        user.website = req.body.website ? req.body.website.toLowerCase() : user.website;
        // ... other fields as fallback
        if (req.files?.profilePicture) user.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
    }

    const updatedUser = await user.save();

    // 3. Return Merged Profile
    let responseData = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        title: updatedUser.title,
        about: updatedUser.about, // User about
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        education: updatedUser.education,
        certifications: updatedUser.certifications,
        currentLocation: updatedUser.currentLocation,
        preferredLocations: updatedUser.preferredLocations,
        resume: updatedUser.resume,
        resumes: updatedUser.resumes,
        profilePicture: updatedUser.profilePicture,
        bannerPicture: updatedUser.bannerPicture,
        companyId: updatedUser.companyId,
        companyRole: updatedUser.companyRole,
        token: generateToken(updatedUser._id),
        following: updatedUser.following,
        followers: updatedUser.followers
    };

    if (company) {
        responseData = {
            ...responseData,
            companyName: company.name,
            website: company.website,
            companyEmail: company.companyEmail,
            companyLocation: company.companyLocation,
            companyCategory: company.companyCategory,
            companyType: company.companyType,
            foundedYear: company.foundedYear,
            employeeCount: company.employeeCount,
            about: company.about, // Company about
            profilePicture: company.profilePicture, // Company logo
            bannerPicture: company.bannerPicture,
            whyJoinUs: company.whyJoinUs,
            employerVerification: company.employerVerification
        };
    }

    res.json(responseData);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Change Password
// @route   PUT /api/auth/update-password
// @access  Private
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (await user.matchPassword(oldPassword)) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid old password' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get public user profile (Company details)
// @route   GET /api/auth/user/:id
// @access  Public
const getPublicUserProfile = async (req, res) => {
  try {
    // Try fetching as Company ID first
    let company = await Company.findById(req.params.id);
    
    if (company) {
      return res.json({
        _id: company._id,
        companyName: company.name,
        website: company.website,
        companyEmail: company.companyEmail,
        companyLocation: company.companyLocation,
        companyCategory: company.companyCategory,
        companyType: company.companyType,
        foundedYear: company.foundedYear,
        employeeCount: company.employeeCount,
        about: company.about,
        location: company.companyLocation,
        profilePicture: company.profilePicture,
        bannerPicture: company.bannerPicture,
        employerVerification: company.employerVerification,
        whyJoinUs: company.whyJoinUs,
        isCompanyEntity: true
      });
    }

    // Fallback to User if not a Company (Legacy compatibility or Job Seeker profile)
    const user = await User.findById(req.params.id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        companyName: user.companyName,
        website: user.website,
        companyEmail: user.companyEmail,
        companyLocation: user.companyLocation,
        companyCategory: user.companyCategory,
        companyType: user.companyType,
        foundedYear: user.foundedYear,
        employeeCount: user.employeeCount,
        email: user.email,
        about: user.about,
        location: user.companyLocation || user.currentLocation,  
        profilePicture: user.profilePicture,
        bannerPicture: user.bannerPicture,
        role: user.role,
        employerVerification: user.employerVerification,
        whyJoinUs: user.whyJoinUs,
      });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get all companies (Employers)
// @route   GET /api/auth/companies
// @access  Public

// ... (Inside getCompanies)

// @route   GET /api/auth/companies
// @access  Public
const getCompanies = async (req, res) => {
    try {
        const { search, location } = req.query;
        let query = { role: 'Employer', isActive: true };

        if (search) {
            query.companyName = { $regex: search, $options: 'i' };
        }
        if (location) {
            query.companyLocation = { $regex: location, $options: 'i' };
        }

        const companies = await User.find(query).select('-password');

        // Add Job Count
        const companiesWithJobs = await Promise.all(companies.map(async (company) => {
            const jobCount = await Job.countDocuments({ 
                postedBy: company._id, 
                status: 'Active' 
            });
            return {
                ...company.toObject(),
                jobCount
            };
        }));

        res.json(companiesWithJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Follow a company
// @route   POST /api/auth/follow/:id
// @access  Private (Job Seeker)
const followCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const jobSeekerId = req.user._id;

        const company = await User.findById(companyId);
        if (!company || company.role !== 'Employer') {
             return res.status(404).json({ message: 'Company not found' });
        }

        // Add to Job Seeker's following list
        await User.findByIdAndUpdate(jobSeekerId, {
            $addToSet: { following: companyId }
        });

        // Add to Company's followers list
        await User.findByIdAndUpdate(companyId, {
            $addToSet: { followers: jobSeekerId }
        });

        const Notification = require('../models/Notification');
        await Notification.create({
            recipient: companyId,
            sender: jobSeekerId,
            type: 'FOLLOW',
            message: `${req.user.name} started following your company`,
            relatedId: jobSeekerId,
            relatedModel: 'User'
        });

        // Real-time Push Notification
        if (req.io) {
            req.io.to(companyId).emit('notification', {
                message: `${req.user.name} started following your company`,
                type: 'FOLLOW'
            });
        }

        res.json({ message: 'Followed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Unfollow a company
// @route   DELETE /api/auth/unfollow/:id
// @access  Private (Job Seeker)
const unfollowCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const jobSeekerId = req.user._id;

        // Remove from Job Seeker's following list
        await User.findByIdAndUpdate(jobSeekerId, {
            $pull: { following: companyId }
        });

        // Remove from Company's followers list
        await User.findByIdAndUpdate(companyId, {
            $pull: { followers: jobSeekerId }
        });

        res.json({ message: 'Unfollowed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { 
  authUser, 
  registerUser, 
  googleLogin, 
  forgotPassword, 
  resetPassword, 
  getUserProfile, 
  updateUserProfile,
  changePassword,
  deleteAccount,
  getPublicUserProfile,
  getCompanies,
  followCompany,
  unfollowCompany
};
