const adminModel = require("../models/adminModel");
const tagsModel = require("../models/tagsModel");
const catchAsyncError = require("../utils/catchAsyncError");

exports.createTag = catchAsyncError(async (req, res) => {
  //   res.send(req.userId);
  const { tag_name } = req.body;
  const { userId } = req;

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
    });
  } else {
    tag = await tagsModel.create({
      tag_name,
      userId,
      role: "Admin",
    });
  }

  res.status(201).json({
    success: true,
    tag,
    message: "Tag Created Successfully",
  });
});

exports.getTag = catchAsyncError(async (req, res) => {
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
  const tags = await tagsModel.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    tags,
    message: "tags fetched Successfully",
  });
});

exports.updateTag = catchAsyncError(async (req, res, next) => {
  const tag = await tagsModel.findById(req.params.id);
  if (!tag) return next(new ErrorHandler("Tag Not Found", 404));
  const { tag_name } = req.body;

  tag.tag_name = tag_name || tag.tag_name;
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
