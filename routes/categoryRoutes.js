const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  createCategory,
  getCategorys,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();
router.post("/create-category", auth, isAdmin, createCategory);
router.get("/get-categorys", getCategorys);
router.get("/get-category/:id", getCategory);
router.patch("/update-category/:id", auth, isAdmin, updateCategory);
router.delete("/delete-category/:id", auth, isAdmin, deleteCategory);

module.exports = router;
