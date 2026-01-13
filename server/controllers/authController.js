const User = require('../models/User');
const Job = require('../models/Job');
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
      companyName: user.companyName,
      website: user.website,
      companyEmail: user.companyEmail,
      companyLocation: user.companyLocation,
      companyCategory: user.companyCategory,
      companyType: user.companyType,
      foundedYear: user.foundedYear,
      employeeCount: user.employeeCount,
      about: user.about,
      profilePicture: user.profilePicture,
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
      companyName: user.companyName,
      website: user.website,
      companyEmail: user.companyEmail,
      companyLocation: user.companyLocation,
      companyCategory: user.companyCategory,
      companyType: user.companyType,
      foundedYear: user.foundedYear,
      employeeCount: user.employeeCount,
      about: user.about,
      profilePicture: user.profilePicture,
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
        companyName: user.companyName,
        website: user.website,
        companyEmail: user.companyEmail,
        companyLocation: user.companyLocation,
        companyCategory: user.companyCategory,
        companyType: user.companyType,
        foundedYear: user.foundedYear,
        employeeCount: user.employeeCount,
        about: user.about,
        profilePicture: user.profilePicture,
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
        companyName: user.companyName,
        website: user.website,
        companyEmail: user.companyEmail,
        companyCategory: user.companyCategory,
        companyType: user.companyType,
        foundedYear: user.foundedYear,
        employeeCount: user.employeeCount,
        about: user.about,
        profilePicture: user.profilePicture,
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
  const resetUrl = `${process.env.VITE_CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

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
    });
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
    user.name = req.body.name || user.name;
    user.companyName = req.body.companyName || user.companyName;
    user.website = req.body.website || user.website;
    user.companyEmail = req.body.companyEmail || user.companyEmail;
    user.companyLocation = req.body.companyLocation || user.companyLocation;
    user.companyCategory = req.body.companyCategory || user.companyCategory;
    user.companyType = req.body.companyType || user.companyType;
    user.foundedYear = req.body.foundedYear || user.foundedYear;
    user.employeeCount = req.body.employeeCount || user.employeeCount;

    // Email cannot be edited
    user.title = req.body.title || user.title;
    user.about = req.body.about || user.about;
    user.currentLocation = req.body.currentLocation || user.currentLocation;
    
    if (req.body.preferredLocations) {
        if (typeof req.body.preferredLocations === 'string') {
            try {
                user.preferredLocations = JSON.parse(req.body.preferredLocations);
            } catch (e) {
                user.preferredLocations = [req.body.preferredLocations];
            }
        } else {
            user.preferredLocations = req.body.preferredLocations;
        }
    }
    
    // Parse structured data (coming as JSON strings from FormData)
    if (req.body.skills) {
         // Handle both comma-separated string and array
         if (typeof req.body.skills === 'string') {
            user.skills = req.body.skills.split(',').map(skill => skill.trim());
         } else if (Array.isArray(req.body.skills)) {
            user.skills = req.body.skills;
         }
    }
    
    if (req.body.experience) {
        if (typeof req.body.experience === 'string') {
            // Try to parse as JSON first
            try {
                const parsed = JSON.parse(req.body.experience);
                if (Array.isArray(parsed)) user.experience = parsed;
                else user.experience = [{ description: req.body.experience }];
            } catch (e) {
                // If parse fails, treat as simple string description
                user.experience = [{ description: req.body.experience }];
            }
        } else if (Array.isArray(req.body.experience)) {
             user.experience = req.body.experience;
        }
    }

    if (req.body.education) {
        if (typeof req.body.education === 'string') {
            try {
                const parsed = JSON.parse(req.body.education);
                if (Array.isArray(parsed)) user.education = parsed;
                else user.education = [{ degree: req.body.education }];
            } catch (e) {
                user.education = [{ degree: req.body.education }];
            }
        } else if (Array.isArray(req.body.education)) {
            user.education = req.body.education;
        }
    }

    if (req.body.certifications) {
         try {
             if (typeof req.body.certifications === 'string') {
                  user.certifications = JSON.parse(req.body.certifications);
             } else {
                  user.certifications = req.body.certifications;
             }
        } catch (e) { console.error("Error parsing certifications", e); }
    }
    
    // Handle Files
    if (req.files) {
        if (req.files.profilePicture) {
            user.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
        }
        if (req.files.resume) {
            // Check limit (Max 3)
            if (user.resumes.length >= 3) {
                 return res.status(400).json({ message: 'Maximum 3 resumes allowed. Please delete one to upload a new one.' });
            }

            const newResumePath = `/uploads/${req.files.resume[0].filename}`;
            const newResumeName = req.files.resume[0].originalname;

            // Add to resumes array
            user.resumes.push({
                name: newResumeName,
                file: newResumePath,
                uploadedAt: new Date()
            });

            // Set as active resume
            user.resume = newResumePath;
        }
    }
    
    // Handle Setting Active Resume
    if (req.body.activeResumeId) {
        const targetResume = user.resumes.id(req.body.activeResumeId);
        if (targetResume) {
            user.resume = targetResume.file;
        }
    }

    // Handle Resume Deletion
    if (req.body.deleteResumeId) {
        const resumeToDelete = user.resumes.id(req.body.deleteResumeId);
        if (resumeToDelete) {
            // Remove from array
            user.resumes.pull(req.body.deleteResumeId);
            
            // If the deleted resume was the active one, pick the most recent one or null
            if (user.resume === resumeToDelete.file) {
                if (user.resumes.length > 0) {
                    // Set the last one as active
                    user.resume = user.resumes[user.resumes.length - 1].file;
                } else {
                    user.resume = undefined;
                }
            }
        }
    } else if (req.body.deleteResume === 'true') {
        // Fallback for old single delete logic - clear active and all resumes? 
        // Or just clear active? Let's assume clear all for safety or just handle legacy
        user.resume = undefined;
        user.resumes = []; 
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      companyName: updatedUser.companyName,
      website: updatedUser.website,
      companyEmail: updatedUser.companyEmail,
      companyLocation: updatedUser.companyLocation,
      companyCategory: updatedUser.companyCategory,
      companyType: updatedUser.companyType,
      foundedYear: updatedUser.foundedYear,
      employeeCount: updatedUser.employeeCount,
      title: updatedUser.title,
      about: updatedUser.about,
      skills: updatedUser.skills,
      experience: updatedUser.experience,
      education: updatedUser.education,
      certifications: updatedUser.certifications,
      currentLocation: updatedUser.currentLocation,
      preferredLocations: updatedUser.preferredLocations,
      resume: updatedUser.resume,
      resumes: updatedUser.resumes,
      profilePicture: updatedUser.profilePicture,
      token: generateToken(updatedUser._id),
    });
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
    const user = await User.findById(req.params.id);

    if (user) {
      // Only return public info needed for company profile
      res.json({
        _id: user._id,
        name: user.name, // Employer Name (or Company Representative)
        companyName: user.companyName,
        website: user.website,
        companyEmail: user.companyEmail,
        companyLocation: user.companyLocation,
        companyCategory: user.companyCategory,
        companyType: user.companyType,
        foundedYear: user.foundedYear,
        employeeCount: user.employeeCount,
        email: user.email, // Can limit if privacy needed, but often useful for contact
        about: user.about,
        location: user.companyLocation || user.currentLocation,  
        profilePicture: user.profilePicture,
        role: user.role,
        employerVerification: user.employerVerification
      });
    } else {
      res.status(404).json({ message: 'User not found' });
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
const getCompanies = async (req, res) => {
  try {
    const employers = await User.find({ role: 'Employer', companyName: { $exists: true, $ne: '' } })
      .select('_id companyName companyLocation companyCategory companyType employeeCount about profilePicture website');

    const companiesWithJobCount = await Promise.all(
      employers.map(async (employer) => {
        const jobCount = await Job.countDocuments({ postedBy: employer._id, status: 'Active' });
        return {
          ...employer._doc,
          jobCount,
        };
      })
    );

    res.json(companiesWithJobCount);
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
  getCompanies
};
