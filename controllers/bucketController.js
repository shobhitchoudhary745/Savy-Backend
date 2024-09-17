const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const bucketModel = require("../models/bucketModel");
const categoryModel = require("../models/categoryModel");
const { s3Uploadv2 } = require("../utils/s3");

exports.createBucket = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  let location = "";
  if (req.file) {
    const data = await s3Uploadv2(req.file);
    location = data.Location.split(".com")[1];
  }

  const bucket = await bucketModel.create({
    name,
    image: location,
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
  let location = "";
  if (req.file) {
    const data = await s3Uploadv2(req.file);
    location = data.Location.split(".com")[1];
  }

  if (name) bucket.name = name;
  if (location) bucket.image = location;
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

exports.getBucketList = catchAsyncError(async (req, res, next) => {
  const buckets = await bucketModel.find().lean();
  for (const bucket of buckets) {
    const categories = await categoryModel.find({ bucket: bucket._id });
    bucket.categories = categories;
  }
  res.status(200).json({
    success: true,
    buckets,
    message: "Bucket List Fetched Successfully",
  });
});
