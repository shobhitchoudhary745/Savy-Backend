const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const faqModel = require("../models/faqModel");

exports.createFaq = catchAsyncError(async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  const faq = await faqModel.create({
    title,
    description,
  });
  res.status(201).json({
    success: true,
    faq,
    message: "Faq Created Successfully",
  });
});

exports.getFaqs = catchAsyncError(async (req, res, next) => {
  const faqs = await faqModel.find().lean();
  res.status(200).json({
    success: true,
    faqs,
    message: "Faqs fetched Successfully",
  });
});

exports.getFaq = catchAsyncError(async (req, res, next) => {
  const faq = await faqModel.findById(req.params.id);
  if (!faq) return next(new ErrorHandler("Faq Not Found", 404));
  res.status(200).json({
    success: true,
    faq,
    message: "Faq fetched Successfully",
  });
});

exports.updateFaq = catchAsyncError(async (req, res, next) => {
  const faq = await faqModel.findById(req.params.id);
  if (!faq) return next(new ErrorHandler("Faq Not Found", 404));
  const { title, description } = req.body;

  if (title) faq.title = title;
  if (description) faq.description = description;
  await faq.save();

  res.status(200).json({
    success: true,
    faq,
    message: "Faq Updated Successfully",
  });
});

exports.deleteFaq = catchAsyncError(async (req, res, next) => {
  const faq = await faqModel.findByIdAndDelete(req.params.id);
  if (!faq) return next(new ErrorHandler("Faq Not Found", 404));
  res.status(200).json({
    success: true,
    faq,
    message: "Faq deleted Successfully",
  });
});
