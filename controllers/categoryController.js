const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const categoryModel = require("../models/categoryModel");

exports.createCategory = catchAsyncError(async (req, res, next) => {
  const { name, bucket } = req.body;
  if (!name || !bucket) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  const category = await categoryModel.create({
    name,
    bucket,
  });
  res.status(201).json({
    success: true,
    category,
    message: "Category Created Successfully",
  });
});

exports.getCategorys = catchAsyncError(async (req, res, next) => {
  const categorys = await categoryModel.find().lean();
  res.status(200).json({
    success: true,
    categorys,
    message: "Categorys fetched Successfully",
  });
});

exports.getCategory = catchAsyncError(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category Not Found", 404));
  res.status(200).json({
    success: true,
    category,
    message: "Category fetched Successfully",
  });
});

exports.updateCategory = catchAsyncError(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.id);
  if (!category) return next(new ErrorHandler("category Not Found", 404));
  const { name, bucket } = req.body;

  if (name) category.name = name;
  if (bucket) category.bucket = bucket;
  await category.save();

  res.status(200).json({
    success: true,
    category,
    message: "Category Updated Successfully",
  });
});

exports.deleteCategory = catchAsyncError(async (req, res, next) => {
  const category = await categoryModel.findByIdAndDelete(req.params.id);
  if (!category) return next(new ErrorHandler("Category Not Found", 404));
  res.status(200).json({
    success: true,
    category,
    message: "Category deleted Successfully",
  });
});
