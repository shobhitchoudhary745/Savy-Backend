const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const budgetModel = require("../models/budgetModel");
const billModel = require("../models/billModel");

exports.createBudget = catchAsyncError(async (req, res, next) => {
  const { category, budget_amount, is_bill,payday } = req.body;
  if (!category || !budget_amount||!payday) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  const budget1 = await budgetModel.create({
    category,
    payday,
    budget_amount,
    user: req.userId,
    is_bill,
  });
  if (is_bill) {
    await billModel.create({ category, budget: budget1._id, budget_amount });
  }
  res.status(201).json({
    success: true,
    budget: budget1,
    message: "Budget Created Successfully",
  });
});

exports.getBudgets = catchAsyncError(async (req, res, next) => {
  const budgets = await budgetModel
    .find({ user: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json({
    success: true,
    budgets,
    message: "Budgets fetched Successfully",
  });
});

exports.getBudget = catchAsyncError(async (req, res, next) => {
  const budget = await budgetModel.findById(req.params.id);
  if (!budget) return next(new ErrorHandler("Budget Not Found", 404));
  res.status(200).json({
    success: true,
    budget,
    message: "Budget fetched Successfully",
  });
});

exports.updateBudget = catchAsyncError(async (req, res, next) => {
  const budget = await budgetModel.findById(req.params.id);
  if (!budget) return next(new ErrorHandler("Budget Not Found", 404));

  res.status(200).json({
    success: true,
    budget,
    message: "Budget Updated Successfully",
  });
});

exports.deleteBudget = catchAsyncError(async (req, res, next) => {
  const budget = await budgetModel.findByIdAndDelete(req.params.id);
  if (!budget) return next(new ErrorHandler("Budget Not Found", 404));
  res.status(200).json({
    success: true,
    budget,
    message: "Budget deleted Successfully",
  });
});
