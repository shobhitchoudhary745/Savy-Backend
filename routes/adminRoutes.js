const express = require("express");
const {
  registerAdmin,
  adminLogin,
  getOtp,
  submitOtp,
  resetPassword,
} = require("../controllers/adminController");
const router = express.Router();

router.post("/create-admin", registerAdmin);
router.post("/admin-login", adminLogin);
router.post("/get-otp", getOtp);
router.post("/submit-otp", submitOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
