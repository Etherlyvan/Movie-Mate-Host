const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const auth = require("../middleware/auth");
const {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validation");

// Auth routes
router.post(
  "/register",
  validateRegister,
  handleValidationErrors,
  AuthController.register
);
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  AuthController.login
);
router.post("/logout", auth, AuthController.logout);
router.get("/me", auth, AuthController.getMe);
router.post("/refresh", auth, AuthController.refreshToken);

module.exports = router;
