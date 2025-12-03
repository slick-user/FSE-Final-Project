const { body, param, query, validationResult } = require('express-validator');

/**
 * Check validation results and return errors
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation failed', 
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Auth validation rules
exports.registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('rollNo')
    .trim()
    .notEmpty().withMessage('Roll number is required')
    .matches(/^[A-Za-z0-9-]+$/).withMessage('Invalid roll number format'),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Password must contain letters and numbers'),
  
  body('role')
    .optional()
    .isIn(['student', 'admin', 'driver']).withMessage('Invalid role')
];

exports.loginRules = [
  body('rollNo').trim().notEmpty().withMessage('Roll number is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.forgotPasswordRules = [
  body('rollNo').trim().notEmpty().withMessage('Roll number is required')
];

exports.resetPasswordRules = [
  body('rollNo').trim().notEmpty().withMessage('Roll number is required'),
  body('resetCode').trim().notEmpty().withMessage('Reset code is required'),
  body('newPassword')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Bus validation rules
exports.busRules = [
  body('busNumber')
    .trim()
    .notEmpty().withMessage('Bus number is required')
    .isLength({ max: 20 }).withMessage('Bus number too long'),
  
  body('model')
    .trim()
    .notEmpty().withMessage('Model is required'),
  
  body('driverName')
    .trim()
    .notEmpty().withMessage('Driver name is required'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Capacity must be between 1 and 100')
];

// Schedule validation rules
exports.scheduleRules = [
  body('busId')
    .isMongoId().withMessage('Invalid bus ID'),
  
  body('stopId')
    .isMongoId().withMessage('Invalid stop ID'),
  
  body('date')
    .isISO8601().withMessage('Invalid date format'),
  
  body('departureTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format (use HH:MM)')
];

// Stop validation rules
exports.stopRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Stop name is required'),
  
  body('zone')
    .isIn(['Islamabad', 'Rawalpindi']).withMessage('Zone must be Islamabad or Rawalpindi'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [lng, lat]')
    .custom((value) => {
      const [lng, lat] = value;
      return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
    }).withMessage('Invalid coordinates')
];

// Reservation validation rules
exports.reservationRules = [
  body('scheduleId')
    .isMongoId().withMessage('Invalid schedule ID'),
  
  body('seatNumber')
    .isInt({ min: 1 }).withMessage('Seat number must be a positive integer')
];

// MongoDB ID parameter validation
exports.mongoIdParam = (paramName = 'id') => 
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`);

// Query validation
exports.queryDateRange = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
];