const User = require('../models/User');
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
      email: user.email,
      role: user.role,
      title: user.title,
      about: user.about,
      skills: user.skills,
      experience: user.experience,
      education: user.education,
      certifications: user.certifications,
      resume: user.resume,
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
    // Email cannot be edited
    user.title = req.body.title || user.title;
    user.about = req.body.about || user.about;
    
    // Parse structured data (coming as JSON strings from FormData)
    if (req.body.skills) {
         user.skills = req.body.skills.split(',').map(skill => skill.trim());
    }
    
    if (req.body.experience) {
        try {
            user.experience = JSON.parse(req.body.experience);
        } catch (e) { console.error("Error parsing experience", e); }
    }

    if (req.body.education) {
        try {
             user.education = JSON.parse(req.body.education);
        } catch (e) { console.error("Error parsing education", e); }
    }

    if (req.body.certifications) {
         try {
             user.certifications = JSON.parse(req.body.certifications);
        } catch (e) { console.error("Error parsing certifications", e); }
    }
    
    // Handle Files
    if (req.files) {
        if (req.files.profilePicture) {
            user.profilePicture = `/uploads/${req.files.profilePicture[0].filename}`;
        }
        if (req.files.resume) {
            user.resume = `/uploads/${req.files.resume[0].filename}`;
        }
    }
    
    // Handle Resume Deletion
    if (req.body.deleteResume === 'true') {
        user.resume = undefined;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      title: updatedUser.title,
      about: updatedUser.about,
      skills: updatedUser.skills,
      experience: updatedUser.experience,
      education: updatedUser.education,
      certifications: updatedUser.certifications,
      resume: updatedUser.resume,
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

// @desc    Delete User Account
// @route   DELETE /api/auth/profile
// @access  Private
const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404).json({ message: 'User not found' });
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
  deleteAccount
};
