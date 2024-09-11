const adminModel = require("../models/adminModel");
const blogsModel = require("../models/blogsModel");
const bucketModel = require("../models/bucketModel");
const categoryModel = require("../models/categoryModel");
const faqModel = require("../models/faqModel");
const queryModel = require("../models/queryModel");
const testimonialModel = require("../models/testimonialModel");
const userModel = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { sendEmail } = require("../utils/sendEmail");

exports.registerAdmin = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const admin = await adminModel.create({ name, email, password });

  await admin.save();

  res.status(200).json({
    success: true,
    message: "Admin Created Successfully",
  });
});

exports.adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await adminModel.findOne({ email }).select("+password");
  if (!admin) {
    return next(new ErrorHandler("Invalid Credentials", 400));
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid Credentials", 400));
  }

  const token = await admin.getToken();
  admin.password = undefined;
  res.status(200).json({
    success: true,
    admin,
    token,
    message: "Admin Login Successfully",
  });
});

exports.getOtp = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const admin = await adminModel.findOne({ email });
  if (!admin) {
    return next(new ErrorHandler("Admin Not Exist with this Email!", 401));
  }
  const min = 1000;
  const max = 9999;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  admin.otp = otp;
  await admin.save();
  const options = {
    email: email.toLowerCase(),
    subject: "Forgot Password Request",
    html: `<div style="font-family: 'Arial', sans-serif; text-align: center; background-color: #f4f4f4; margin-top: 15px; padding: 0;">

    <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333333;">Forgot Password Code</h1>
      <p style="color: #666666;">Your one time code is:</p>
      <p style="font-size: 24px; font-weight: bold; color: #009688; margin: 0;">${otp}</p>
      <p style="color: #666666;">Use this code to Forgot your Password</p>
    </div>

    <div style="color: #888888;">
      <p style="margin-bottom: 10px;">Regards, <span style="color: #caa257;">Team Scienda</span></p>
    </div>
  
  </div>`,
  };
  await sendEmail(options);
  res.status(200).json({
    success: true,
    message: "Otp Send Successfully",
  });
});

exports.submitOtp = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  const admin = await adminModel.findOne({
    email,
    otp,
  });
  if (admin) {
    admin.otp = 1;
    await admin.save();
    res.status(202).send({
      status: 202,
      success: true,
      message: "Otp Verify Successfully!",
    });
  } else {
    res.status(400).send({
      status: 400,
      success: false,
      message: "Invalid otp!",
    });
  }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const admin = await adminModel
    .findOne({
      email,
    })
    .select("+password");
  const isPasswordMatched = await admin.matchPassword(password);
  if (isPasswordMatched) {
    return next(new ErrorHandler("New Password is same as Old Password", 400));
  }
  if (admin && admin.otp == 1) {
    admin.password = password;
    admin.otp = null;
    await admin.save();
    res.status(202).send({
      status: 202,
      success: true,
      message: "Password Changed Successfully!",
    });
  } else {
    res.status(400).send({
      status: 400,
      success: false,
      message: "Invalid otp!",
    });
  }
});

exports.getDashboardData = catchAsyncError(async (req, res, next) => {
  const [Blogs, Faqs, Testimonials, Users, Querys, Buckets, Categorys] =
    await Promise.all([
      blogsModel.countDocuments(),
      faqModel.countDocuments(),
      testimonialModel.countDocuments(),
      userModel.countDocuments(),
      queryModel.countDocuments(),
      bucketModel.countDocuments(),
      categoryModel.countDocuments(),
    ]);

  res.status(200).send({
    success: true,
    message: "Dashboard data Fetched Successfully",
    data: [
      { Blogs },
      { Faqs },
      { Testimonials },
      { Users },
      { Querys },
      { Buckets },
      { Categorys },
    ],
  });
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const { current_password, new_password, confirm_password } = req.body;
  if (new_password != confirm_password)
    return next(
      new ErrorHandler("New Password is not match with Confirm Password", 400)
    );
  const admin = await adminModel.findById(req.userId);
  if (!admin) {
    return next(new ErrorHandler("Admin not found", 400));
  }
  const isMatch = await admin.matchPassword(current_password);
  if (!isMatch) return next(new ErrorHandler("Current Password is Wrong", 400));
  admin.password = new_password;
  await admin.save();
});

exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await userModel.find().lean();
  res.status(200).send({
    success: true,
    users,
    message: "User Fetched Successfully",
  });
});
