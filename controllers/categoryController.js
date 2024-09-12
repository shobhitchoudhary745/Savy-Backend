const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const categoryModel = require("../models/categoryModel");

exports.createCategory = catchAsyncError(async (req, res, next) => {
  const { name, bucket } = req.body;
  if (!name || !bucket) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  let location = "";
  if (req.file) {
    const data = await s3Uploadv2(req.file);
    location = data.Location.split(".com")[1];
  }

  const category = await categoryModel.create({
    name,
    bucket,
    image: location,
  });
  res.status(201).json({
    success: true,
    category,
    message: "Category Created Successfully",
  });
});

exports.getCategorys = catchAsyncError(async (req, res, next) => {
  const categorys = await categoryModel.find().sort({ createdAt: -1 }).lean();
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
  let location = "";
  if (req.file) {
    const data = await s3Uploadv2(req.file);
    location = data.Location.split(".com")[1];
  }

  if (name) category.name = name;
  if (bucket) category.bucket = bucket;
  if (location) category.image = location;
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
