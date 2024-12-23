const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const assetModel = require("../models/assetsModel");
const { s3Uploadv2 } = require("../utils/s3");
const assetLevel1Model = require("../models/assetLevel1Model");

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
    image: location,
  });
  res.status(201).json({
    success: true,
    asset,
    message: "Asset/Liability Created Successfully",
  });
});

exports.getAssets = catchAsyncError(async (req, res, next) => {
  const { type } = req.query;
  const query = {};
  if (type) query.type = type;
  const assets = await assetModel.find(query).sort({ createdAt: -1 }).lean();
  for (const asset of assets) {
    const assetlevel1 = await assetLevel1Model.countDocuments({
      asset_liabilty_ref: asset._id,
    });
    asset.assetlevel1Count = assetlevel1;
  }
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
  if (location) asset.image = location;
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
