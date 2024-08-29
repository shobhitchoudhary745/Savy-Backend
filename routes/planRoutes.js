const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  createPlan,
  getAllPlans,
  getPlan,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");

const router = express.Router();
router.post("/create-plan", auth, isAdmin, createPlan);
router.get("/get-plans", getAllPlans);
router.get("/get-plan/:id", getPlan);
router.patch("/update-plan/:id", auth, isAdmin, updatePlan);
router.delete("/delete-plan/:id", auth, isAdmin, deletePlan);

module.exports = router;
