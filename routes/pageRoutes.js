const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  createPage,
  getPages,
  getPage,
  updatePage,
  deletePage,
} = require("../controllers/pageController");

const router = express.Router();
router.post("/create-page", auth, isAdmin, createPage);
router.get("/get-pages", getPages);
router.get("/get-page/:id", getPage);
router.patch("/update-page/:id", auth, isAdmin, updatePage);
router.delete("/delete-page/:id", auth, isAdmin, deletePage);

module.exports = router;
