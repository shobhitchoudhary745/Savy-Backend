const express = require("express");
const {
  createTag,
  getTag,
  getAllTags,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");
const { auth, isAdmin } = require("../middlewares/auth");

const router = express.Router();

router.post("/create-tag", auth, createTag);
router.get("/get-tag/:id", getTag);
router.get("/get-tags",auth, getAllTags);
router.patch("/update-tag/:id", auth, updateTag);
router.delete("/delete-tag/:id", auth, isAdmin, deleteTag);
module.exports = router;
