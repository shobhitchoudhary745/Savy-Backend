const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const queryModel = require("../models/queryModel");

exports.createQuery = catchAsyncError(async (req, res, next) => {
  const { name, email, message, company } = req.body;
  if (!email || !message || !name) {
    return next(new ErrorHandler("Name Email and Message is required", 400));
  }
  const query = await queryModel.create({
    name,
    email,
    message,
    company,
  });
  res.status(201).json({
    success: true,
    query,
    message: "Query Submitted Successfully",
  });
});

exports.getQuerys = catchAsyncError(async (req, res, next) => {
  const querys = await queryModel.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({
    success: true,
    querys,
    message: "Querys fetched Successfully",
  });
});

exports.deleteQuery = catchAsyncError(async (req, res, next) => {
  const query = await queryModel.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    query,
    message: "Query deleted Successfully",
  });
});
