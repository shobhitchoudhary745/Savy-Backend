const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  register,
  login,
  getOtpToForgotPassword,
  resetPassword,
  submitOtpToForgotPassword,
} = require("../controllers/userController");
const { upload } = require("../utils/s3");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/getotp-to-forgot-password", getOtpToForgotPassword);
router.post("/submitotp-to-forgot-password", submitOtpToForgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
