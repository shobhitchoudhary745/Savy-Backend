const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  createFaq,
  getFaqs,
  getFaq,
  updateFaq,
  deleteFaq,
} = require("../controllers/faqController");

const router = express.Router();
router.post("/create-faq", auth, isAdmin, createFaq);
router.get("/get-faqs", getFaqs);
router.get("/get-faq/:id", getFaq);
router.patch("/update-faq/:id", auth, isAdmin, updateFaq);
router.delete("/delete-faq/:id", auth, isAdmin, deleteFaq);

module.exports = router;
