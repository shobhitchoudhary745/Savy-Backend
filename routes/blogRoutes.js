const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  createBlog,
  getBlogs,
  deleteBlog,
  getBlog,
  updateBlog,
} = require("../controllers/blogController");
const { upload } = require("../utils/s3");

const router = express.Router();
router.post("/create-blog", auth, isAdmin, upload.single("image"), createBlog);
router.get("/get-blogs", getBlogs);
router.get("/get-blog/:id", getBlog);
router.patch(
  "/update-blog/:id",
  auth,
  isAdmin,
  upload.single("image"),
  updateBlog
);
router.delete("/delete-blog/:id", auth, isAdmin, deleteBlog);

module.exports = router;
