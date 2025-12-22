// middleware/validation.js - Request validation middleware
const { sanitizeObject, validateRequired, validateEmail, validatePhone, validatePrice, validateRating, validateDate, validateLength } = require('../lib/validation');

/**
 * Sanitize request body
 */
function sanitizeBody(req, res, next) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  next();
}

/**
 * Validate booking request
 */
function validateBooking(req, res, next) {
  const { name, email, guests, totalAmount } = req.body;
  
  const required = validateRequired(req.body, ['name', 'email', 'guests', 'totalAmount']);
  if (!required.valid) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      missing: required.missing 
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validateLength(name, 2, 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }

  const guestsNum = parseInt(guests, 10);
  if (!Number.isInteger(guestsNum) || guestsNum < 1 || guestsNum > 50) {
    return res.status(400).json({ message: 'Guests must be between 1 and 50' });
  }

  if (!validatePrice(totalAmount)) {
    return res.status(400).json({ message: 'Invalid total amount' });
  }

  next();
}

/**
 * Validate review request
 */
function validateReview(req, res, next) {
  const { rating, comment } = req.body;
  
  if (rating !== undefined && !validateRating(rating)) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  if (comment && !validateLength(comment, 0, 2000)) {
    return res.status(400).json({ message: 'Comment must be less than 2000 characters' });
  }

  next();
}

/**
 * Validate user registration
 */
function validateRegister(req, res, next) {
  const { email, password, name } = req.body;
  
  const required = validateRequired(req.body, ['email', 'password', 'name']);
  if (!required.valid) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      missing: required.missing 
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validateLength(password, 6, 100)) {
    return res.status(400).json({ message: 'Password must be between 6 and 100 characters' });
  }

  if (!validateLength(name, 2, 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }

  next();
}

/**
 * Validate contact form
 */
function validateContact(req, res, next) {
  const { email, subject, message } = req.body;
  
  const required = validateRequired(req.body, ['email', 'subject', 'message']);
  if (!required.valid) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      missing: required.missing 
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validateLength(subject, 5, 200)) {
    return res.status(400).json({ message: 'Subject must be between 5 and 200 characters' });
  }

  if (!validateLength(message, 10, 5000)) {
    return res.status(400).json({ message: 'Message must be between 10 and 5000 characters' });
  }

  next();
}

module.exports = {
  sanitizeBody,
  validateBooking,
  validateReview,
  validateRegister,
  validateContact,
};

