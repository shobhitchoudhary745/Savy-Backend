const planModel = require("../models/planModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

exports.createPlan = catchAsyncError(async (req, res, next) => {
  const {
    plan_name,
    tag_line,
    annual_price,
    monthly_price,
    features,
    status,
    plan_type,
  } = req.body;

  if (
    !plan_name ||
    !tag_line ||
    !annual_price ||
    !monthly_price ||
    !features ||
    !status ||
    !plan_type
  ) {
    return next(new ErrorHandler("All Fieleds are required", 400));
  }

  const plan = await planModel.create({
    plan_name,
    tag_line,
    annual_price,
    monthly_price,
    features,
    status,
    plan_type,
  });
  res.status(201).json({
    success: true,
    plan,
    message: "Plan Created Successfully",
  });
});

exports.getAllPlans = catchAsyncError(async (req, res, next) => {
  const plans = await planModel.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    plans,
    message: "Plans Fetched Successfully",
  });
});

exports.getPlan = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const plan = await planModel.findById(id);
  if (!plan) return next(new ErrorHandler("Plan Not Found", 404));
  res.status(200).json({
    success: true,
    plan,
    message: "Plan Fsetched Successfully",
  });
});

exports.updatePlan = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const plan = await planModel.findById(id);
  if (!plan) return next(new ErrorHandler("Plan Not Found", 404));

  const {
    plan_name,
    tag_line,
    annual_price,
    monthly_price,
    features,
    status,
    plan_type,
  } = req.body;

  plan.plan_name = plan_name || plan.plan_name;
  plan.tag_line = tag_line || plan.tag_line;
  plan.annual_price = annual_price || plan.annual_price;
  plan.monthly_price = monthly_price || plan.monthly_price;
  plan.features = features || plan.features;
  plan.status = status || plan.status;
  plan.plan_type = plan_type || plan.plan_type;

  await plan.save();

  res.status(200).json({
    success: true,
    plan,
    message: "Plan Updated Successfully",
  });
});

exports.deletePlan = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const plan = await planModel.findByIdAndDelete(id);
  if (!plan) return next(new ErrorHandler("Plan Not Found", 404));

  res.status(200).json({
    success: true,
    plan,
    message: "Plan deleted Successfully",
  });
});
