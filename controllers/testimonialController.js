const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const testimonialModel = require("../models/testimonialModel");
const { s3Uploadv2 } = require("../utils/s3");

exports.createTestimonial = catchAsyncError(async (req, res, next) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  } else {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  const testimonial = await testimonialModel.create({
    name,
    message,
    profile: location,
  });
  res.status(201).json({
    success: true,
    testimonial,
    message: "Testimonial Created Successfully",
  });
});

exports.getTestimonials = catchAsyncError(async (req, res, next) => {
  const testimonials = await testimonialModel.find().lean();
  res.status(200).json({
    success: true,
    testimonials,
    message: "Testimonials fetched Successfully",
  });
});

exports.getTestimonial = catchAsyncError(async (req, res, next) => {
  const testimonial = await testimonialModel.findById(req.params.id);
  if (!testimonial) return next(new ErrorHandler("Testimonial Not Found", 404));
  res.status(200).json({
    success: true,
    testimonial,
    message: "Testimonial fetched Successfully",
  });
});

exports.updateTestimonial = catchAsyncError(async (req, res, next) => {
  const testimonial = await testimonialModel.findById(req.params.id);
  if (!testimonial) return next(new ErrorHandler("Testimonial Not Found", 404));
  const { name, message } = req.body;

  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }

  if (name) testimonial.name = name;
  if (message) testimonial.message = message;
  if (location) testimonial.profile = location;
  await testimonial.save();

  res.status(200).json({
    success: true,
    testimonial,
    message: "Testimonial Updated Successfully",
  });
});

exports.deleteTestimonial = catchAsyncError(async (req, res, next) => {
  const testimonial = await testimonialModel.findByIdAndDelete(req.params.id);
  if (!testimonial) return next(new ErrorHandler("Testimonial Not Found", 404));
  res.status(200).json({
    success: true,
    testimonial,
    message: "Testimonial deleted Successfully",
  });
});
