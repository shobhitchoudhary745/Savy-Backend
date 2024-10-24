const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const budgetModel = require("../models/budgetModel");
const billModel = require("../models/billModel");

exports.createBudget = catchAsyncError(async (req, res, next) => {
  const { category, budget_amount, is_bill, payday } = req.body;
  if (!category || !budget_amount) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  const obj = {};

  if (req.body.date) {
    obj.date = new Date(req.body.date);
  }
  if (req.body.payday) {
    obj.payday = payday;
  }
  const budget1 = await budgetModel.create({
    category,
    budget_amount,
    user: req.userId,
    is_bill,
    ...obj,
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
    .populate("payday")
    .populate({
      path: "category",
      populate: {
        path: "bucket",
      },
    })
    .sort({ createdAt: -1 })
    .lean();
  let total = budgets.reduce((pre, budget) => {
    return pre + budget.budget_amount;
  }, 0);
  res.status(200).json({
    success: true,
    budgets,
    total,
    message: "Budgets fetched Successfully",
  });
});

exports.getBudget = catchAsyncError(async (req, res, next) => {
  const budget = await budgetModel
    .findById(req.params.id)
    .populate("payday")
    .populate({
      path: "category",
      populate: {
        path: "bucket",
      },
    })
    .lean();
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
  const { category, budget_amount, payday, date } = req.body;
  if (category) budget.category = category;
  if (budget_amount) budget.budget_amount = budget_amount;
  if (payday) budget.payday = payday;
  if (date) budget.date = new Date(date);
  await budget.save();

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
