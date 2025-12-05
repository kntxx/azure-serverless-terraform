const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const authMiddleware = require("../config/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
