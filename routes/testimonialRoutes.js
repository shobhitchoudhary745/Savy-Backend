const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const { upload } = require("../utils/s3");
const {
  createTestimonial,
  getTestimonials,
  getTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");

const router = express.Router();
router.post(
  "/create-testimonial",
  auth,
  isAdmin,
  upload.single("image"),
  createTestimonial
);
router.get("/get-testimonials", getTestimonials);
router.get("/get-testimonial/:id", getTestimonial);
router.patch(
  "/update-testimonial/:id",
  auth,
  isAdmin,
  upload.single("image"),
  updateTestimonial
);
router.delete("/delete-testimonial/:id", auth, isAdmin, deleteTestimonial);

module.exports = router;
