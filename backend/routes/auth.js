const express = require("express");
const AuthController = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validation");
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", registerValidation, AuthController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", loginValidation, AuthController.login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, AuthController.getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", auth, AuthController.logout);

// @route   POST /api/auth/refresh
// @desc    Refresh token
// @access  Private
router.post("/refresh", auth, AuthController.refreshToken);

module.exports = router;
