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
  updateTransaction,
  getUserAccounts,
  getTransactions,
  getTransaction,
  getCashFlowDataIn,
  getCashFlowDataOut,
  getCashFlowDataNet,
  getCashFlowOverview,
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
router.get("/get-user-account", auth, getUserAccounts);
router.post("/get-user-token", getUserToken);
router.get("/get-graph-data", auth, getGraphData);
router.get("/get-cashflow-data-in", auth, getCashFlowDataIn);
router.get("/get-cashflow-data-overview", auth, getCashFlowOverview);
router.get("/get-cashflow-data-out", auth, getCashFlowDataOut);
router.get("/get-cashflow-data-net", auth, getCashFlowDataNet);
router.patch("/update-transaction/:id", auth, updateTransaction);
router.get("/get-transactions", auth, getTransactions);
router.get("/get-transaction/:id", auth, getTransaction);

module.exports = router;
