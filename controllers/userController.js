const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

const userModel = require("../models/userModel");
const { generateOtp } = require("../utils/generateCode");
const { sendEmail } = require("../utils/sendEmail");

const sendData = async (user, statusCode, res, purpose) => {
  const token = await user.getJWTToken();
  const newUser = {
    // first_name: user.first_name,
    // last_name: user.last_name,
    email: user.email,
    // is_verfied: user.is_verfied,
    _id: user._id,
    // profile_url: user.profile_url,
  };
  if (purpose) {
    res.status(201).send({
      message: "Account Created Successsfully",
      token,
      user: newUser,
    });
    // res.status(statusCode).json({
    //   status: "otp send successfully",
    // });
  } else {
    res.status(statusCode).json({
      user: newUser,
      token,
      status: "user login successfully",
    });
  }
};

exports.register = catchAsyncError(async (req, res, next) => {
  const { email, password, confirm_password, code, confirm_code } = req.body;
  const otp = generateOtp();
  const existingUser = await userModel.findOne({ email, is_verfied: true });
  if (existingUser)
    return next(new ErrorHandler("User Already Exist with this email", 400));

  if (!email || !password) {
    return next(new ErrorHandler("All fieleds are required"));
  }
  if (password !== confirm_password) {
    return next(new ErrorHandler("Password must be same as Confirm Password"));
  }

  if (code !== confirm_code) {
    return next(new ErrorHandler("Code must be same as Confirm Code"));
  }

  if (code.length != 6) {
    return next(new ErrorHandler("Code must be of six digit"));
  }

  const user = await userModel.create({
    email,
    password,
    code,
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
  // await sendEmail(options);
  sendData(user, 201, res, "register");
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password, code } = req.body;
  if (!email) return next(new ErrorHandler("Please enter your email", 400));

  if (!password && !code)
    return next(new ErrorHandler("Please enter Password or code", 400));

  const user = await userModel
    .findOne({ email: email.toLowerCase() })
    .select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  if (code) {
    if (user.code === code) {
      return sendData(user, 200, res);
    } else {
      return next(new ErrorHandler("Invalid Code", 401));
    }
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email or password!", 401));
  // if (!user.is_verified) {
  //   return next(new ErrorHandler("Verify Your Email before login.", 403));
  // }

  sendData(user, 200, res);
});

exports.getOtpToForgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User Not Exist with this Email!", 401));
  }

  const otp = generateOtp();

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
  const send = await sendEmail(options);
  if (send) {
    user.otp = otp;
    await user.save();
    res.status(200).send({
      message: "OTP Send Successfully",
      status: 200,
      success: true,
    });
  } else {
    res.status(500).send({
      message: "Internal Server Error",
      status: 500,
      success: false,
    });
  }
});

exports.submitOtpToForgotPassword = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await userModel.findOne({
    email,
    otp,
  });
  if (user) {
    // user.password = password;
    user.otp = 0;
    await user.save();
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
  const user = await userModel
    .findOne({
      email,
    })
    .select("+password");
  const isPasswordMatched = await user.comparePassword(password);
  if (isPasswordMatched) {
    return next(new ErrorHandler("New Password is same as Old Password", 400));
  }
  // console.log(user);
  if (user && user.otp == 0) {
    user.password = password;
    // user.otp = 0;
    await user.save();
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
