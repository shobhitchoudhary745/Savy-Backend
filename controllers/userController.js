const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

const userModel = require("../models/userModel");
const { generateOtp } = require("../utils/generateCode");

const sendData = async (user, statusCode, res, purpose) => {
  const token = await user.getJWTToken();
  const newUser = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    is_verfied: user.is_verfied,
    _id: user._id,
    profile_url: user.profile_url,
  };
  if (purpose) {
    res.status(statusCode).json({
      status: "otp send successfully",
    });
  } else {
    res.status(statusCode).json({
      user: newUser,
      token,
      status: "user login successfully",
    });
  }
};

exports.register = catchAsyncError(async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  const otp = generateOtp();
  const existingUser = await userModel.findOne({ email, is_verfied: true });
  if (existingUser)
    return next(new ErrorHandler("User Already Exist with this email", 400));

  if (!first_name || !last_name || !email || !password) {
    return next(new ErrorHandler("All fieleds are required"));
  }

  const user = await userModel.create({
    first_name,
    last_name,
    email,
    password,
  });

  const options = {
    email: email.toLowerCase(),
    subject: "Email Verification",
    html: `<div style="font-family: 'Arial', sans-serif; text-align: center; background-color: #f4f4f4; margin-top: 15px; padding: 0;">

    <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333333;">Account Verification Code</h1>
      <p style="color: #666666;">Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; color: #009688; margin: 0;">${otp}</p>
      <p style="color: #666666;">Use this code to verify your Account</p>
    </div>

    <div style="color: #888888;">
      <p style="margin-bottom: 10px;">Regards, <span style="color: #caa257;">Team Scienda</span></p>
    </div>
  
  </div>`,
  };
  await sendEmail(options);
  sendData(user, 201, res, "register");
});
