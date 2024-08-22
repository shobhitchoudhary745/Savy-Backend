const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const goalModel = require("../models/goalModel");
const { s3Uploadv2 } = require("../utils/s3");

exports.createGoal = catchAsyncError(async (req, res, next) => {
  const { description, date, amount } = req.body;
  if (!amount || !description || !date) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }
  const goal = await goalModel.create({
    date: new Date(date),
    description,
    image_url: location,
    amount,
    user: req.userId,
  });
  res.status(201).json({
    success: true,
    goal,
    message: "Goal Created Successfully",
  });
});

exports.getGoals = catchAsyncError(async (req, res, next) => {
  const goals = await goalModel
    .find({ user: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({
    success: true,
    goals,
    message: "Goals fetched Successfully",
  });
});

exports.getGoal = catchAsyncError(async (req, res, next) => {
  const goal = await goalModel.findById(req.params.id);
  if (!goal) return next(new ErrorHandler("Goal Not Found", 404));
  res.status(200).json({
    success: true,
    goal,
    message: "Goal fetched Successfully",
  });
});

exports.updateGoal = catchAsyncError(async (req, res, next) => {
  const goal = await goalModel.findById(req.params.id);
  if (!goal) return next(new ErrorHandler("Goal Not Found", 404));
  const { description, date, amount } = req.body;

  let location = "";
  if (req.file) {
    const result = await s3Uploadv2(req.file);
    location = result.Location.split(".com")[1];
  }

  if (amount) goal.amount = amount;
  if (date) goal.date = new Date(date);
  if (description) goal.description = description;
  if (location) goal.image = location;
  await goal.save();

  res.status(200).json({
    success: true,
    goal,
    message: "Goal Updated Successfully",
  });
});

exports.deleteGoal = catchAsyncError(async (req, res, next) => {
  const goal = await goalModel.findByIdAndDelete(req.params.id);
  if (!goal) return next(new ErrorHandler("Goal Not Found", 404));
  res.status(200).json({
    success: true,
    goal,
    message: "Goal deleted Successfully",
  });
});
