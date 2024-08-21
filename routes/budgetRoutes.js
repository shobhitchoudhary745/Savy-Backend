const express = require("express");

const { auth } = require("../middlewares/auth");
const {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

const router = express.Router();
router.post("/create-budget", auth, createBudget);
router.get("/get-budgets", auth, getBudgets);
router.get("/get-budget/:id", auth, getBudget);
router.patch("/update-budget/:id", auth, updateBudget);
router.delete("/delete-budget/:id", auth, deleteBudget);

module.exports = router;
