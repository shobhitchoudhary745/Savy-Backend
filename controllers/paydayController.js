const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const paydayModel = require("../models/payDayModel");

exports.createPayday = catchAsyncError(async (req, res, next) => {
  const { pay_date, pay_period, amount, source } = req.body;
  if (!pay_date || !pay_period || !amount || !source) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  const payday = await paydayModel.create({
    pay_date: new Date(pay_date),
    pay_period,
    amount,
    user: req.userId,
    source,
  });
  res.status(201).json({
    success: true,
    payday,
    message: "Payday Created Successfully",
  });
});

exports.getPaydays = catchAsyncError(async (req, res, next) => {
  const paydays = await paydayModel
    .find({ user: req.userId })
    .sort({ createdAt: -1 })
    .lean();
  let total = paydays.reduce((pre, pay) => {
    return pre + pay.amount;
  }, 0);
  res.status(200).json({
    success: true,
    paydays,
    total,
    message: "Paydays fetched Successfully",
  });
});

exports.getPayday = catchAsyncError(async (req, res, next) => {
  const payday = await paydayModel.findById(req.params.id);
  if (!payday) return next(new ErrorHandler("Payday Not Found", 404));
  res.status(200).json({
    success: true,
    payday,
    message: "Payday fetched Successfully",
  });
});

exports.updatePayday = catchAsyncError(async (req, res, next) => {
  const payday = await paydayModel.findById(req.params.id);
  if (!payday) return next(new ErrorHandler("Payday Not Found", 404));
  const { pay_date, pay_period, amount, source } = req.body;

  if (pay_date) payday.pay_date = new Date(pay_date);
  if (pay_period) payday.pay_period = pay_period;
  if (amount) payday.amount = amount;
  if (source) payday.source = source;
  await payday.save();

  res.status(200).json({
    success: true,
    payday,
    message: "Payday Updated Successfully",
  });
});

exports.deletePayday = catchAsyncError(async (req, res, next) => {
  const payday = await paydayModel.findByIdAndDelete(req.params.id);
  if (!payday) return next(new ErrorHandler("Payday Not Found", 404));
  res.status(200).json({
    success: true,
    payday,
    message: "Payday deleted Successfully",
  });
});
