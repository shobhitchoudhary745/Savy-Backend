const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const blogModel = require("../models/blogsModel");
const { s3Uploadv2 } = require("../utils/s3");

exports.createBlog = catchAsyncError(async (req, res, next) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  } else {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  const blog = await blogModel.create({
    title,
    description,
    image_url: location,
  });
  res.status(201).json({
    success: true,
    blog,
    message: "Blog Created Successfully",
  });
});

exports.getBlogs = catchAsyncError(async (req, res, next) => {
  const blogs = await blogModel.find().lean();
  res.status(200).json({
    success: true,
    blogs,
    message: "Blogs fetched Successfully",
  });
});

exports.getBlog = catchAsyncError(async (req, res, next) => {
  const blog = await blogModel.findById(req.params.id);
  if (!blog) return next(new ErrorHandler("Blog Not Found", 404));
  res.status(200).json({
    success: true,
    blog,
    message: "Blog fetched Successfully",
  });
});

exports.updateBlog = catchAsyncError(async (req, res, next) => {
  const blog = await blogModel.findById(req.params.id);
  if (!blog) return next(new ErrorHandler("Blog Not Found", 404));
  const { title, description } = req.body;

  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }

  if (title) blog.title = title;
  if (description) blog.description = description;
  if (location) blog.image_url = location;

  res.status(200).json({
    success: true,
    blog,
    message: "Blog Updated Successfully",
  });
});

exports.deleteBlog = catchAsyncError(async (req, res, next) => {
  const blog = await blogModel.findByIdAndDelete(req.params.id);
  if (!blog) return next(new ErrorHandler("Blog Not Found", 404));
  res.status(200).json({
    success: true,
    blog,
    message: "Blog deleted Successfully",
  });
});
