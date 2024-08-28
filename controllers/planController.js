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
