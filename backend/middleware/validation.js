// backend/middleware/validation.js
const { body, validationResult } = require("express-validator");

// Validation rules for user registration
const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3-20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .custom((value) => {
      // Ensure username is not just numbers
      if (/^\d+$/.test(value)) {
        throw new Error("Username cannot be only numbers");
      }
      return true;
    }),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Validation rules for user login
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

// Validation rules for bookmark
const validateBookmark = [
  body("movieTitle")
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(
      "Movie title is required and must be less than 200 characters"
    ),

  body("moviePoster")
    .optional()
    .isString()
    .withMessage("Movie poster must be a string"),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param || err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateBookmark,
  handleValidationErrors,
};
