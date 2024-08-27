const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const { createPlan } = require("../controllers/planController");

const router = express.Router();
router.post("/create-plan", auth, isAdmin, createPlan);

module.exports = router;
