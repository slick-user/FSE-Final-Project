exports.errorHandler = (err, req, res, next) => {
    console.error('ERROR:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method
    });
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: `${field} already exists`,
        field
      });
    }
    
    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: `Invalid ${err.path}: ${err.value}`
      });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token expired'
      });
    }
    
    // Multer file upload errors
    if (err.name === 'MulterError') {
      return res.status(400).json({
        success: false,
        error: `File upload error: ${err.message}`
      });
    }
    
    // Default server error
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  /**
   * 404 Not Found handler
   */
  exports.notFound = (req, res) => {
    res.status(404).json({ 
      success: false,
      error: `Route not found: ${req.method} ${req.path}` 
    });
  };
  
  /**
   * Async handler wrapper to catch errors
   */
  exports.asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };