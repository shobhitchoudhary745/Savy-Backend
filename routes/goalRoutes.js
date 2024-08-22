const express = require("express");

const { auth } = require("../middlewares/auth");

const { upload } = require("../utils/s3");
const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

const router = express.Router();
router.post("/create-goal", auth, upload.single("image"), createGoal);
router.get("/get-goals", auth, getGoals);
router.get("/get-goal/:id", auth, getGoal);
router.patch("/update-goal/:id", auth, upload.single("image"), updateGoal);
router.delete("/delete-goal/:id", auth, deleteGoal);

module.exports = router;
