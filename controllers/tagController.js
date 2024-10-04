const adminModel = require("../models/adminModel");
const tagsModel = require("../models/tagsModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { s3Uploadv2 } = require("../utils/s3");

exports.createTag = catchAsyncError(async (req, res, next) => {
  //   res.send(req.userId);
  const { tag_name } = req.body;
  const { userId } = req;
  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }

  if (!tag_name) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  const admin = await adminModel.findById(req.userId);
  let tag;
  if (!admin) {
    tag = await tagsModel.create({
      tag_name,
      userId,
      role: "User",
      image: location,
    });
  } else {
    tag = await tagsModel.create({
      tag_name,
      userId,
      role: "Admin",
      image: location
    });
  }

  res.status(201).json({
    success: true,
    tag,
    message: "Tag Created Successfully",
  });
});

exports.getTag = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const tag = await tagsModel.findById(id);
  if (!tag) return next(new ErrorHandler("Tag Not Found", 404));
  res.status(200).json({
    success: true,
    tag,
    message: "Tag Fetched Successfully",
  });
});

exports.getAllTags = catchAsyncError(async (req, res, next) => {
  const tags = await tagsModel
    .find({ $or: [{ role: "Admin" }, { userId: req.userId }] })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({
    success: true,
    tags,
    message: "Tags fetched Successfully",
  });
});

exports.updateTag = catchAsyncError(async (req, res, next) => {
  const tag = await tagsModel.findById(req.params.id);
  if (!tag) return next(new ErrorHandler("Tag Not Found", 404));
  const { tag_name } = req.body;
  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }

  tag.tag_name = tag_name || tag.tag_name;
  if (location) tag.image = location;
  await tag.save();

  res.status(200).json({
    success: true,
    tag,
    message: "Tag Updated Successfully",
  });
});

exports.deleteTag = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const tag = await tagsModel.findByIdAndDelete(id);
  if (!tag) return next(new ErrorHandler("Tag Not Found", 404));

  res.status(200).json({
    success: true,
    tag,
    message: "Tag deleted Successfully",
  });
});
