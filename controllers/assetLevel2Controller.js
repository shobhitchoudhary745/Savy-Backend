const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const assetModelLevel2 = require("../models/assetLevel2Model");
const { s3Uploadv2 } = require("../utils/s3");

exports.createAssetLevel2 = catchAsyncError(async (req, res, next) => {
  const { title, asset_level1_ref } = req.body;
  if (!title || !asset_level1_ref) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  } else {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  const asset = await assetModelLevel2.create({
    title,
    image_url: location,
    asset_level1_ref,
  });
  res.status(201).json({
    success: true,
    asset,
    message: "Asset/Liability Created Successfully",
  });
});

exports.getAssetsLevel2 = catchAsyncError(async (req, res, next) => {
  const { asset_level1_ref } = req.query;
  const query = {};
  if (asset_level1_ref) query.asset_level1_ref = asset_level1_ref;
  const assets = await assetModelLevel2
    .find(query)
    .sort({ createdAt: -1 })
    .populate("asset_level1_ref")
    .lean();
  res.status(200).json({
    success: true,
    assets,
    message: "Assets/Liability fetched Successfully",
  });
});

exports.getAssetLevel2 = catchAsyncError(async (req, res, next) => {
  const asset = await assetModelLevel2.findById(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability fetched Successfully",
  });
});

exports.updateAssetLevel2 = catchAsyncError(async (req, res, next) => {
  const asset = await assetModelLevel2.findById(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  const { title, asset_level1_ref } = req.body;

  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }

  if (title) asset.title = title;
  if (asset_level1_ref) asset.asset_level1_ref = asset_level1_ref;
  if (location) asset.image_url = location;
  await asset.save();

  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability Updated Successfully",
  });
});

exports.deleteAssetLevel2 = catchAsyncError(async (req, res, next) => {
  const asset = await assetModelLevel2.findByIdAndDelete(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability deleted Successfully",
  });
});
