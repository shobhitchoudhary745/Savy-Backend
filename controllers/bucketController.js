const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const bucketModel = require("../models/bucketModel");

exports.createBucket = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  const bucket = await bucketModel.create({
    name,
  });
  res.status(201).json({
    success: true,
    bucket,
    message: "Bucket Created Successfully",
  });
});

exports.getBuckets = catchAsyncError(async (req, res, next) => {
  const buckets = await bucketModel.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    buckets,
    message: "Buckets fetched Successfully",
  });
});

exports.getBucket = catchAsyncError(async (req, res, next) => {
  const bucket = await bucketModel.findById(req.params.id);
  if (!bucket) return next(new ErrorHandler("Bucket Not Found", 404));
  res.status(200).json({
    success: true,
    bucket,
    message: "Bucket fetched Successfully",
  });
});

exports.updateBucket = catchAsyncError(async (req, res, next) => {
  const bucket = await bucketModel.findById(req.params.id);
  if (!bucket) return next(new ErrorHandler("Bucket Not Found", 404));
  const { name } = req.body;

  if (name) bucket.name = name;
  await bucket.save();

  res.status(200).json({
    success: true,
    bucket,
    message: "Bucket Updated Successfully",
  });
});

exports.deleteBucket = catchAsyncError(async (req, res, next) => {
  const bucket = await bucketModel.findByIdAndDelete(req.params.id);
  if (!bucket) return next(new ErrorHandler("Bucket Not Found", 404));
  res.status(200).json({
    success: true,
    bucket,
    message: "Bucket deleted Successfully",
  });
});
