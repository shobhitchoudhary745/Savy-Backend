const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  register,
  login,
  getOtpToForgotPassword,
  resetPassword,
  submitOtpToForgotPassword,
  createBasiqUser,
  getUserBanks,
  getUserConcent,
  getConnection,
  getUserToken,
  getGraphData,
  getCashFlowData,
  updateTransaction,
} = require("../controllers/userController");
const { upload } = require("../utils/s3");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/getotp-to-forgot-password", getOtpToForgotPassword);
router.post("/submitotp-to-forgot-password", submitOtpToForgotPassword);
router.post("/reset-password", resetPassword);
router.post("/create-basiq-user", createBasiqUser);
router.get("/get-user-consent", getUserConcent);
router.get("/get-user-connection", getConnection);
router.get("/get-user-account", getUserBanks);
router.post("/get-user-token", getUserToken);
router.get("/get-graph-data", auth, getGraphData);
router.get("/get-cashflow-data", auth, getCashFlowData);
router.patch("/update-transaction/:id", auth, updateTransaction);

module.exports = router;
