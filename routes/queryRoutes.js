const express = require("express");
const {
  createQuery,
  getQuerys,
  deleteQuery,
} = require("../controllers/queryController");

const { auth, isAdmin } = require("../middlewares/auth");

const router = express.Router();
router.post("/create-query", createQuery);
router.get("/get-querys", auth, isAdmin, getQuerys);
router.delete("/delete-query/:id", auth, isAdmin, deleteQuery);

module.exports = router;
