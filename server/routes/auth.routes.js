const express = require('express');
const authController = require('../controllers/auth.controller.js');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const { 
  validate, 
  registerRules, 
  loginRules,
  forgotPasswordRules,
  resetPasswordRules
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', 
  upload.single('profilePhoto'),
  registerRules,
  validate,
  authController.register
);

router.post('/login', 
  loginRules, 
  validate, 
  authController.login
);

router.post('/forgot-password', 
  forgotPasswordRules,
  validate,
  authController.forgotPassword
);

router.post('/reset-password', 
  resetPasswordRules,
  validate,
  authController.resetPassword
);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

module.exports = router;