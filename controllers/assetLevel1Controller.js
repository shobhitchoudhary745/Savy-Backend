const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const assetModelLevel1 = require("../models/assetLevel1Model");
const { s3Uploadv2 } = require("../utils/s3");

exports.createAssetLevel1 = catchAsyncError(async (req, res, next) => {
  const { title, asset_liabilty_ref } = req.body;
  if (!title || !asset_liabilty_ref) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  } else {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  const asset = await assetModelLevel1.create({
    title,
    image: location,
    asset_liabilty_ref,
  });
  res.status(201).json({
    success: true,
    asset,
    message: "Asset/Liability Created Successfully",
  });
});

exports.getAssetsLevel1 = catchAsyncError(async (req, res, next) => {
  const { asset_ref } = req.query;
  const query = {};
  if (asset_ref) query.asset_liabilty_ref = asset_ref;
  const assets = await assetModelLevel1
    .find(query)
    .sort({ createdAt: -1 })
    .populate("asset_liabilty_ref")
    .lean();
  res.status(200).json({
    success: true,
    assets,
    message: "Assets/Liability fetched Successfully",
  });
});

exports.getAssetLevel1 = catchAsyncError(async (req, res, next) => {
  const asset = await assetModelLevel1.findById(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability fetched Successfully",
  });
});

exports.updateAssetLevel1 = catchAsyncError(async (req, res, next) => {
  const asset = await assetModelLevel1.findById(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  const { title, asset_liabilty_ref } = req.body;

  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }

  if (title) asset.title = title;
  if (asset_liabilty_ref) asset.asset_liabilty_ref = asset_liabilty_ref;
  if (location) asset.image = location;
  await asset.save();

  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability Updated Successfully",
  });
});

exports.deleteAssetLevel1 = catchAsyncError(async (req, res, next) => {
  const asset = await assetModelLevel1.findByIdAndDelete(req.params.id);
  if (!asset) return next(new ErrorHandler("Asset/Liability Not Found", 404));
  res.status(200).json({
    success: true,
    asset,
    message: "Asset/Liability deleted Successfully",
  });
});
