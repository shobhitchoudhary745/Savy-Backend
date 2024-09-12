const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  createCategory,
  getCategorys,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { upload } = require("../utils/s3");

const router = express.Router();
router.post(
  "/create-category",
  auth,
  isAdmin,
  upload.single("image"),
  createCategory
);
router.get("/get-categorys", getCategorys);
router.get("/get-category/:id", getCategory);
router.patch(
  "/update-category/:id",
  auth,
  isAdmin,
  upload.single("image"),
  updateCategory
);
router.delete("/delete-category/:id", auth, isAdmin, deleteCategory);

module.exports = router;
