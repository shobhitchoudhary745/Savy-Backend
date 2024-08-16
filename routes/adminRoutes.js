const express = require("express");
const {
  registerAdmin,
  adminLogin,
  getOtp,
  submitOtp,
  resetPassword,
  getDashboardData,
} = require("../controllers/adminController");
const { auth, isAdmin } = require("../middlewares/auth");
const router = express.Router();

router.post("/create-admin", registerAdmin);
router.post("/admin-login", adminLogin);
router.post("/get-otp", getOtp);
router.post("/submit-otp", submitOtp);
router.post("/reset-password", resetPassword);
router.get("/get-dashboard-data", auth, isAdmin, getDashboardData);

module.exports = router;
