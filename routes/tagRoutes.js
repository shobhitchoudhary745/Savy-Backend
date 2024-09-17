const express = require("express");
const {
  createTag,
  getTag,
  getAllTags,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");
const { auth, isAdmin } = require("../middlewares/auth");
const { upload } = require("../utils/s3");

const router = express.Router();

router.post("/create-tag", auth, upload.single("image"), createTag);
router.get("/get-tag/:id", getTag);
router.get("/get-tags", auth, getAllTags);
router.patch("/update-tag/:id", auth, upload.single("image"), updateTag);
router.delete("/delete-tag/:id", auth, isAdmin, deleteTag);
module.exports = router;
