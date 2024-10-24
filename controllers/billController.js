const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const billModel = require("../models/billModel");

exports.createBill = catchAsyncError(async (req, res, next) => {
  const { category, budget, budget_amount, date } = req.body;
  if (!category || !budget_amount) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }
  const obj = {};
  if (req.body.budget) {
    obj.budget = budget;
  }
  if (req.body.date) {
    obj.date = req.body.date;
  }
  const bill = await billModel.create({
    category,
    budget_amount,
    user: req.userId,
    ...obj,
  });
  res.status(201).json({
    success: true,
    bill,
    message: "Bill Created Successfully",
  });
});

exports.getBills = catchAsyncError(async (req, res, next) => {
  const bills = await billModel
    .find({ user: req.userId })
    .populate("category")
    .populate("budget")
    .sort({ createdAt: -1 })
    .lean();
  let total = bills.reduce((pre, bill) => {
    return pre + bill.budget_amount;
  }, 0);
  res.status(200).json({
    success: true,
    bills,
    total,
    message: "Bills fetched Successfully",
  });
});

exports.getBill = catchAsyncError(async (req, res, next) => {
  const bill = await billModel
    .findById(req.params.id)
    .populate("category")
    .populate("budget")
    .lean();
  if (!bill) return next(new ErrorHandler("Bill Not Found", 404));
  res.status(200).json({
    success: true,
    bill,
    message: "Bill fetched Successfully",
  });
});

exports.updateBill = catchAsyncError(async (req, res, next) => {
  const bill = await billModel.findById(req.params.id);
  if (!bill) return next(new ErrorHandler("Payday Not Found", 404));
  const { category, budget, budget_amount, date } = req.body;
  if (category) bill.category = category;
  if (budget) bill.budget = budget;
  if (budget_amount) bill.budget_amount = budget_amount;
  if (date) bill.date = new Date(date);
  await bill.save();

  res.status(200).json({
    success: true,
    bill,
    message: "Bill Updated Successfully",
  });
});

exports.deleteBill = catchAsyncError(async (req, res, next) => {
  const bill = await billModel.findByIdAndDelete(req.params.id);
  if (!bill) return next(new ErrorHandler("Bill Not Found", 404));
  res.status(200).json({
    success: true,
    bill,
    message: "Bill deleted Successfully",
  });
});
