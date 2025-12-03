const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const config = require('../config/env.js');
const { asyncHandler } = require('../middleware/errorHandler.js');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const { name, rollNo, password, role, disability } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ rollNo: rollNo.toUpperCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'User with this roll number already exists'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    rollNo: rollNo.toUpperCase(),
    role: role || 'student',
    disability: disability === 'true' || disability === true,
    password: hashedPassword,
    profilePhoto: req.file?.path || null
  });

  // Generate token
  const token = generateToken(user._id, user.role);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: userResponse
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { rollNo, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({
    rollNo: rollNo.toUpperCase()
  }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid roll number or password'
    });
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid roll number or password'
    });
  }

  // Generate token
  const token = generateToken(user._id, user.role);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: userResponse
  });
});

/**
 * Get current user
 * GET /api/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId)
    .select('-password')
    .populate('reservedSeats.schedule');

  res.json({
    success: true,
    user
  });
});

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { rollNo } = req.body;

  const user = await User.findOne({
    rollNo: rollNo.toUpperCase()
  }).select('+resetCode +resetCodeExpiry');

  if (!user) {
    // Don't reveal if user exists
    return res.json({
      success: true,
      message: 'If the user exists, a reset code has been sent'
    });
  }

  // Generate 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = resetCode;
  user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  // TODO: Send email/SMS with reset code

  res.json({
    success: true,
    message: 'Reset code generated',
    // Remove this in production:
    ...(config.nodeEnv === 'development' && { code: resetCode })
  });
});

/**
 * Reset password with code
 * POST /api/auth/reset-password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { rollNo, resetCode, newPassword } = req.body;

  const user = await User.findOne({
    rollNo: rollNo.toUpperCase(),
    resetCode
  }).select('+resetCode +resetCodeExpiry +password');

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset code'
    });
  }

  // Check if code expired
  if (user.resetCodeExpiry && user.resetCodeExpiry < new Date()) {
    return res.status(400).json({
      success: false,
      error: 'Reset code has expired. Please request a new one.'
    });
  }

  // Hash new password
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetCode = undefined;
  user.resetCodeExpiry = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

/**
 * Logout (client-side - just return success)
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
