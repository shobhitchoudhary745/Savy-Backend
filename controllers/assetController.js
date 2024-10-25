const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const assetModel = require("../models/assetsModel");
const { s3Uploadv2 } = require("../utils/s3");

exports.createAsset = catchAsyncError(async (req, res, next) => {
  const { title, type } = req.body;
  if (!title || !type) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  } else {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  const asset = await assetModel.create({
    title,
    type,
    image_url: location,
  });
  res.status(201).json({
    success: true,
    asset,
    message: "Asset/Liability Created Successfully",
  });
});

exports.getAssets = catchAsyncError(async (req, res, next) => {
  const assets = await assetModel.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    assets,
    message: "Assets/Liability fetched Successfully",
  });
});

exports.getAsset = catchAsyncError(async (req, res, next) => {
  const asset = await assetModel.findById(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability fetched Successfully",
  });
});

exports.updateAsset = catchAsyncError(async (req, res, next) => {
  const asset = await assetModel.findById(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  const { title, type } = req.body;

  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }

  if (title) asset.title = title;
  if (type) asset.type = type;
  if (location) asset.image_url = location;
  await asset.save();

  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability Updated Successfully",
  });
});

exports.deleteAsset = catchAsyncError(async (req, res, next) => {
  const asset = await assetModel.findByIdAndDelete(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability deleted Successfully",
  });
});
