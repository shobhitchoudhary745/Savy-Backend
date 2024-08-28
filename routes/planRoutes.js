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
router
  .post("/create-plan", auth, isAdmin, createPlan)
  .get("/get-plans", getAllPlans)
  .get("/get-plan/:id", getPlan)
  .patch("/update-plan/:id", auth, isAdmin, updatePlan)
  .delete("/delete-plan", deletePlan);

module.exports = router;
