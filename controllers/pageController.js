const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const pageModel = require("../models/pageModel");

exports.createPage = catchAsyncError(async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  const page = await pageModel.create({
    title,
    description,
  });
  res.status(201).json({
    success: true,
    page,
    message: "Page Created Successfully",
  });
});

exports.getPages = catchAsyncError(async (req, res, next) => {
  const pages = await pageModel.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    pages,
    message: "Pages fetched Successfully",
  });
});

exports.getPage = catchAsyncError(async (req, res, next) => {
  const page = await pageModel.findById(req.params.id);
  if (!page) return next(new ErrorHandler("Page Not Found", 404));
  res.status(200).json({
    success: true,
    page,
    message: "Page fetched Successfully",
  });
});

exports.updatePage = catchAsyncError(async (req, res, next) => {
  const page = await pageModel.findById(req.params.id);
  if (!page) return next(new ErrorHandler("Page Not Found", 404));
  const { title, description } = req.body;

  if (title) page.title = title;
  if (description) page.description = description;
  await page.save();

  res.status(200).json({
    success: true,
    page,
    message: "Page Updated Successfully",
  });
});

exports.deletePage = catchAsyncError(async (req, res, next) => {
  const page = await pageModel.findByIdAndDelete(req.params.id);
  if (!page) return next(new ErrorHandler("Page Not Found", 404));
  res.status(200).json({
    success: true,
    page,
    message: "Page deleted Successfully",
  });
});
