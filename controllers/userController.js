const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const axios = require("axios");
const API_KEY = process.env.BASIC_API;
const transactionModel = require("../models/transactionModel");

const userModel = require("../models/userModel");
const { generateOtp } = require("../utils/generateCode");
const { sendEmail } = require("../utils/sendEmail");
const getToken = require("../utils/getToken");
const billModel = require("../models/billModel");
const { getTwoMonthRanges } = require("../utils/helper");

const sendData = async (user, statusCode, res, purpose) => {
  const token = await user.getJWTToken();
  const newUser = {
    email: user.email,
    user_name: user.user_name,
    _id: user._id,
    account_id: user.account_id,
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
  const { email, password, confirm_password, code, confirm_code, mobile_no } =
    req.body;
  // const otp = generateOtp();
  const existingUser = await userModel.findOne({
    email,
  });
  if (existingUser)
    return next(new ErrorHandler("User Already Exist with this email", 400));

  if (!email || !password || !mobile_no) {
    return next(new ErrorHandler("All fieleds are required"));
  }
  if (password !== confirm_password) {
    return next(new ErrorHandler("Password must be same as Confirm Password"));
  }

  if (code !== confirm_code) {
    return next(new ErrorHandler("Code must be same as Confirm Code"));
  }

  if (code?.toString()?.length != 6) {
    return next(new ErrorHandler("Code must be of six digit"));
  }

  const token = await getToken();

  const { data } = await axios.post(
    `${process.env.BASE_URL}/users`,
    { mobile: mobile_no },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  console.log(data);
  // return;

  const { data: data2 } = await axios.post(
    `${process.env.BASE_URL}/users/${data.id}/auth_link`,
    { redirectUrl: "https://www.stringgeo.com" },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const user = await userModel.create({
    email,
    password,
    code,
    mobile_no,
    customer_id: data.id,
  });

  // const options = {
  //   email: email.toLowerCase(),
  //   subject: "Email Verification",
  //   html: `<div style="font-family: 'Arial', sans-serif; text-align: center; background-color: #f4f4f4; margin-top: 15px; padding: 0;">

  //   <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
  //     <h1 style="color: #333333;">Account Verification Code</h1>
  //     <p style="color: #666666;">Your verification code is:</p>
  //     <p style="font-size: 24px; font-weight: bold; color: #009688; margin: 0;">${otp}</p>
  //     <p style="color: #666666;">Use this code to verify your Account</p>
  //   </div>

  //   <div style="color: #888888;">
  //     <p style="margin-bottom: 10px;">Regards, <span style="color: #caa257;">Team Scienda</span></p>
  //   </div>

  // </div>`,
  // };
  // await sendEmail(options);
  res.status(201).send({
    success: true,
    data: data2,
  });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) return next(new ErrorHandler("Please enter your email", 400));

  if (!password && !code)
    return next(new ErrorHandler("Please enter Password or code", 400));

  const user = await userModel
    .findOne({ email: email.toLowerCase(), is_verified: true })
    .select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  if (user.code === password) {
    return sendData(user, 200, res);
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email or password!", 401));

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

exports.createBasiqUser = catchAsyncError(async (req, res, next) => {
  const { mobile } = req.body;
  const token = await getToken();

  const { data } = await axios.post(
    `${process.env.BASE_URL}/users`,
    { mobile },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  // const consent = await axios.get(
  //   `${process.env.BASE_URL}/users/${data.id}/consents`,
  //   {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       Accept: "application/json",
  //     },
  //   }
  // );
  const { data: data2 } = await axios.post(
    `${process.env.BASE_URL}/users/${data.id}/auth_link`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  console.log(data2);
  res.status(201).send({
    success: true,
    data2,
  });
});

exports.getUserConcent = catchAsyncError(async (req, res, next) => {
  // const { user_id } = req.query;
  const token = await getToken();

  res.status(201).send({
    success: true,
    data,
  });
});

exports.getConnection = catchAsyncError(async (req, res, next) => {
  // const { user_id } = req.query;
  const token = await getToken();
  const { data } = await axios.get(
    `${process.env.BASE_URL}/users/72700687-0cb8-42ad-a94e-e7111740b4eb/connections`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  res.status(201).send({
    success: true,
    data,
    token,
  });
});

exports.getUserToken = catchAsyncError(async (req, res, next) => {
  try {
    const getTokenConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://au-api.basiq.io/token",
      headers: {
        Authorization: `Basic ${API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "basiq-version": "3.0",
      },
      data: new URLSearchParams({
        grant_type: "client_credentials",
      }).toString(),
    };

    const tokenResponse = await axios(getTokenConfig);
    const appAccessToken = tokenResponse.data.access_token;
    console.log("step 1) success");

    // Step 2: Create a user (assuming user creation is required)
    const createUserConfig = {
      method: "post",
      url: "https://au-api.basiq.io/users",
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        "Content-Type": "application/json",
        "basiq-version": "3.0",
      },
      data: JSON.stringify({ mobile: "+611300895996" }),
    };

    const userResponse = await axios(createUserConfig);
    const userId = userResponse.data.id;
    console.log("step 2) success", userId);

    const getUserConfig = {
      method: "get",
      url: `https://au-api.basiq.io/users/${userId}`,
      headers: {
        Authorization: `Bearer ${appAccessToken}`,
        "basiq-version": "3.0",
      },
    };

    const { data } = await axios(getUserConfig);
    console.log(data);
    res.status(200).send({ data });
  } catch (error) {
    console.error(
      "Error in process:",
      error.response ? error.response.data : error.message
    );
  }
});

exports.getUserAccounts = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.userId);
  if (!user) return next(new ErrorHandler("User Not Found", 400));
  const token = await getToken();
  const { data: accounts } = await axios.get(
    `https://au-api.basiq.io/users/${user.customer_id}/accounts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = [];
  const obj = {};
  for (const account of accounts.data) {
    const temp = {};
    if (!obj[account.institution]) {
      const { data } = await axios.get(
        `https://au-api.basiq.io/institutions/${account.institution}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      temp.institution = data.shortName;
      temp.logo = data.logo.links.square;
      obj[account.institution] = {
        shortName: data.shortName,
        logo: data.logo.links.square,
      };
    } else {
      temp.institution = obj[account.institution].shortName;
      temp.logo = obj[account.institution].logo;
    }

    temp.account_id = account.id;
    temp.account_no = account.accountNo;
    temp.amount = Number(account.balance);
    data.push(temp);
  }

  res.status(201).send({
    success: true,
    data,
    message: "Account Fetched Successfully",
  });
});

exports.getGraphData = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.userId);
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const userName = user.user_name;
  const totalAmount = user.amount;
  const creditCard = user.credit_card || 0;
  const monthlyMoneyOut = Array(12).fill(0);
  const monthlyMoneyIn = Array(12).fill(0);
  const transactions = await transactionModel
    .find({
      user: req.userId,
      account_id: user.account_id,
    })
    .populate("category")
    .sort({ date: -1 })
    .lean();
  let moneyIn = 0,
    moneyOut = 0;
  const obj = {};
  for (const transaction of transactions) {
    if (transaction.direction == "credit") {
      moneyIn += Number(transaction.amount);
    } else {
      moneyOut += Number(transaction.amount);
      if (!transaction.category) {
        if (!obj.others) obj.others = Math.abs(transaction.amount);
        else obj.others += Math.abs(transaction.amount);
      } else {
        if (obj[transaction.category.name]) {
          obj[transaction.category.name] += Math.abs(transaction.amount);
        } else {
          obj[transaction.category.name] = Math.abs(transaction.amount);
        }
      }
    }
    if (
      new Date(transaction.date) >= yearStart &&
      transaction.direction != "credit"
    ) {
      const month = new Date(transaction.date).getMonth();
      monthlyMoneyOut[month] += Number(transaction.amount);
    }
    if (
      new Date(transaction.date) >= yearStart &&
      transaction.direction == "credit"
    ) {
      const month = new Date(transaction.date).getMonth();
      monthlyMoneyIn[month] += Number(transaction.amount);
    }
  }

  const graph = [];

  for (let data in obj) {
    const obj1 = {};
    obj1.name = data;
    obj1.value = obj[data];
    graph.push(obj1);
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const graphData = monthlyMoneyOut.map((count, index) => ({
    name: months[index],
    uv: count * -1,
  }));
  const graphData2 = monthlyMoneyIn.map((count, index) => ({
    name: months[index],
    uv: count,
  }));
  res.status(200).send({
    success: true,
    dashboardData: {
      userName,
      moneyOutGraph: graph,
      card1: {
        "Total amount": totalAmount,
        "Credit Card": creditCard,
        moneyInVsMoneyOut: [
          { name: "Money In", uv: moneyIn },
          { name: "Money Out", uv: moneyOut * -1 },
        ],
        monthlyMoneyOut: graphData,
      },
      card2: {
        monthlyMoneyIn: graphData2,
      },
      transactions: transactions.slice(0, 5),
    },
    messaage: "Account Fetched Successfully",
  });
});

exports.getCashFlowOverview = catchAsyncError(async (req, res, next) => {
  const { date } = req.query;
  let dateRange;
  if (date == "last_month") {
    dateRange = getTwoMonthRanges(1, 2);
  } else if (date == "last_three_month") {
    dateRange = getTwoMonthRanges(2, 5);
  } else if (date == "last_six_month") {
    dateRange = getTwoMonthRanges(5, 8);
  }
  const previousTransactions = await transactionModel
    .find({
      user: req.userId,
      date: {
        $gt: new Date("2024-08-01"),
        $lte: new Date("2024-08-31"),
      },
    })
    .lean();
  const currentTransactions = await transactionModel
    .find({
      user: req.userId,
      date: {
        $gt: new Date("2024-09-01"),
        $lte: new Date("2024-09-31"),
      },
    })
    .populate("category")
    .populate("bucket")
    .populate("tag")
    .lean();
  const overview = {};
  const merchant = {},
    category = {},
    bucket = {},
    categoryImage = {},
    bucketImage = {};
  let moneyIn = 0,
    moneyOut = 0,
    previousMoneyIn = 0,
    previousMoneyOut = 0;

  for (const transaction of currentTransactions) {
    if (transaction.direction === "credit") moneyIn += transaction.amount;
    else moneyOut += Math.abs(transaction.amount);
    if (transaction.category) {
      if (category[transaction.category.name])
        category[transaction.category.name] += Math.abs(transaction.amount);
      else {
        category[transaction.category.name] = Math.abs(transaction.amount);
        categoryImage[transaction.category.name] = transaction.category.image;
      }
    } else {
      if (category.others) category.others += Math.abs(transaction.amount);
      else category.others = Math.abs(transaction.amount);
    }

    if (transaction.bucket) {
      if (bucket[transaction.bucket.name])
        bucket[transaction.bucket.name] += Math.abs(transaction.amount);
      else {
        bucket[transaction.bucket.name] = Math.abs(transaction.amount);
        bucketImage[transaction.bucket.name] = transaction.bucket.image;
      }
    } else {
      if (bucket.others) bucket.others += Math.abs(transaction.amount);
      else bucket.others = Math.abs(transaction.amount);
    }

    if (
      merchant[
        transaction.description.split("-")[
          transaction.description.split("-").length - 1
        ]
      ]
    )
      merchant[
        transaction.description.split("-")[
          transaction.description.split("-").length - 1
        ]
      ] += Math.abs(transaction.amount);
    else
      merchant[
        transaction.description.split("-")[
          transaction.description.split("-").length - 1
        ]
      ] = Math.abs(transaction.amount);
  }
  for (const transaction of previousTransactions) {
    if (transaction.direction === "credit")
      previousMoneyIn += transaction.amount;
    else previousMoneyOut += Math.abs(transaction.amount);
  }

  overview.MoneyInvsOutData = [
    { name: "Money In", uv: moneyIn },
    { name: "Money Out", uv: moneyOut },
  ];
  overview.moneyIn = {};
  overview.moneyOut = {};
  overview.moneyIn.graphData = [
    { name: "Previous Month", uv: previousMoneyIn },
    { name: "Current Month", uv: moneyIn },
  ];
  overview.moneyIn.percent =
    moneyIn > previousMoneyIn
      ? ((moneyIn - previousMoneyIn) * 100) / previousMoneyIn
      : (((previousMoneyIn - moneyIn) * 100) / previousMoneyIn) * -1;

  overview.moneyOut.graphData = [
    { name: "Previous Month", uv: previousMoneyOut },
    { name: "Current Month", uv: moneyOut },
  ];

  overview.moneyOut.percent =
    moneyOut > previousMoneyOut
      ? ((moneyOut - previousMoneyOut) * 100) / previousMoneyOut
      : (((previousMoneyOut - moneyOut) * 100) / previousMoneyOut) * -1;
  const arr = [];
  for (let c in category) {
    arr.push({
      category: c,
      value: category[c],
      image: categoryImage[c] || "",
    });
  }
  const arr2 = [];
  for (let c in merchant) {
    arr2.push({ merchant: c, value: merchant[c] });
  }

  const arr3 = [];
  for (let c in bucket) {
    arr3.push({ bucket: c, value: bucket[c], image: bucketImage[c] || "" });
  }

  overview.topCategory = arr.sort((a, b) => b.value - a.value).slice(0, 4);
  overview.topBucket = arr3.sort((a, b) => b.value - a.value).slice(0, 4);
  overview.topMerchant = arr2.sort((a, b) => b.value - a.value).slice(0, 4);

  overview.recentLargestTransactions = currentTransactions
    .map((tran) => {
      return { ...tran, amount: Math.abs(tran.amount) };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  res.status(200).send({
    success: true,
    overview,
    messaage: "Overview Data Fetched Successfully",
  });
});

exports.getCashFlowDataIn = catchAsyncError(async (req, res, next) => {
  const { date, filter } = req.query;
  const obj = {};
  let dateRange;
  if (date == "last_month") {
    dateRange = getTwoMonthRanges(1, 2);
  } else if (date == "last_three_month") {
    dateRange = getTwoMonthRanges(2, 5);
  } else if (date == "last_six_month") {
    dateRange = getTwoMonthRanges(5, 8);
  }
  const previousTransactions = await transactionModel
    .find({
      user: req.userId,
      date: {
        $gt: new Date("2024-08-01"),
        $lte: new Date("2024-08-31"),
      },
      direction: "credit",
    })
    .lean();
  const currentTransactions = await transactionModel
    .find({
      user: req.userId,
      date: {
        $gt: new Date("2024-09-01"),
        $lte: new Date("2024-09-31"),
      },
      direction: "credit",
    })
    .sort({ amount: 1 })
    .populate("category")
    .populate("bucket")
    .populate("tag")
    .lean();
  const image = {};

  const total1 = previousTransactions.reduce((prev, current) => {
    return prev + current.amount;
  }, 0);
  const total2 = currentTransactions.reduce((prev, current) => {
    if (filter) {
      if (filter == "category") {
        if (current.category?.name) {
          if (obj[current.category.name])
            obj[current.category.name] += current.amount;
          else {
            obj[current.category.name] = current.amount;
            image[current.category.name] = current.category.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "bucket") {
        if (current.bucket?.name) {
          if (obj[current.bucket.name])
            obj[current.bucket.name] += current.amount;
          else {
            obj[current.bucket.name] = current.amount;
            image[current.bucket.name] = current.bucket.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "tag") {
        if (current.tag?.tag_name) {
          if (obj[current.tag.tag_name])
            obj[current.tag.tag_name] += current.amount;
          else {
            obj[current.tag.tag_name] = current.amount;
            image[current.tag.tag_name] = current.tag?.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "merchant") {
        if (current.description) {
          if (obj[current.description.split("-")[1]])
            obj[current.description.split("-")[1]] += current.amount;
          else obj[current.description.split("-")[1]] = current.amount;
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
    }
    return prev + current.amount;
  }, 0);
  const moneyIn = {};
  moneyIn.total = total2;
  moneyIn.last = total1;
  moneyIn.last_period = {
    amount: Math.abs(total1 - total2),
    key: total1 < total2 ? "More than last period" : "Less than last period",
  };
  const arr = [];
  const arr2 = [];
  for (let o in obj) {
    let temp = {};
    temp.name = o;
    temp.value = obj[o];
    arr.push(temp);

    arr2.push({
      ...temp,
      percent: parseFloat((obj[o] * 100) / total2).toFixed(2),
      image: image[o] ? image[o] : "",
    });
  }
  if (filter && filter != "transaction") {
    moneyIn.graphData = arr;
    moneyIn.data = arr2.sort((a, b) => a.percent - b.percent).slice(0,5);
  } else {
    let arr = [];
    total2 > total1 &&
      arr.push({
        name: "More than Last Period",
        uv: Math.abs(total2 - total1),
      });
    total2 < total1 &&
      arr.push({
        name: "Less than Last Period",
        uv: Math.abs(total2 - total1),
      });
    arr.push({ name: "Last Period", uv: total1 });
    moneyIn.graphData = arr;
    moneyIn.data = currentTransactions.slice(0,5);
  }

  res.status(200).send({
    success: true,
    moneyIn,
    messaage: "Cash In Data Fetched Successfully",
  });
});

exports.getCashFlowDataOut = catchAsyncError(async (req, res, next) => {
  const { date, filter } = req.query;
  const obj = {};
  let dateRange;
  if (date == "last_month") {
    dateRange = getTwoMonthRanges(1, 2);
  } else if (date == "last_three_month") {
    dateRange = getTwoMonthRanges(2, 5);
  } else if (date == "last_six_month") {
    dateRange = getTwoMonthRanges(5, 8);
  }
  let previousTransactions = await transactionModel
    .find({
      user: req.userId,
      date: {
        $gt: new Date("2024-08-01"),
        $lte: new Date("2024-08-31"),
      },
      direction: "debit",
    })
    .lean();
  let currentTransactions = await transactionModel
    .find({
      user: req.userId,
      date: {
        $gt: new Date("2024-09-01"),
        $lte: new Date("2024-09-31"),
      },
      direction: "debit",
    })
    .sort({ amount: 1 })
    .populate("category")
    .populate("bucket")
    .populate("tag")
    .lean();

  previousTransactions = previousTransactions.map((tran) => {
    return { ...tran, amount: tran.amount * -1 };
  });
  currentTransactions = currentTransactions.map((tran) => {
    return { ...tran, amount: tran.amount * -1 };
  });

  const image = {};

  const total1 = previousTransactions.reduce((prev, current) => {
    return prev + current.amount;
  }, 0);
  const total2 = currentTransactions.reduce((prev, current) => {
    if (filter) {
      if (filter == "category") {
        if (current.category?.name) {
          if (obj[current.category.name])
            obj[current.category.name] += current.amount;
          else {
            obj[current.category.name] = current.amount;
            image[current.category.name] = current.category.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "bucket") {
        if (current.bucket?.name) {
          if (obj[current.bucket.name])
            obj[current.bucket.name] += current.amount;
          else {
            obj[current.bucket.name] = current.amount;
            image[current.bucket.name] = current.bucket.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "tag") {
        if (current.tag?.tag_name) {
          if (obj[current.tag.tag_name])
            obj[current.tag.tag_name] += current.amount;
          else {
            obj[current.tag.tag_name] = current.amount;
            image[current.tag.tag_name] = current.tag?.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "merchant") {
        if (current.description) {
          if (
            obj[
              current.description.split("-")[
                current.description.split("-").length - 1
              ]
            ]
          )
            obj[
              current.description.split("-")[
                current.description.split("-").length - 1
              ]
            ] += current.amount;
          else
            obj[
              current.description.split("-")[
                current.description.split("-").length - 1
              ]
            ] = current.amount;
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
    }
    return prev + current.amount;
  }, 0);
  const moneyIn = {};
  moneyIn.total = total2;
  moneyIn.last = total1;
  moneyIn.last_period = {
    amount: Math.abs(total1 - total2),
    key: total1 < total2 ? "More than last period" : "Less than last period",
  };
  const arr = [];
  const arr2 = [];
  for (let o in obj) {
    let temp = {};
    temp.name = o;
    temp.value = obj[o];
    arr.push(temp);

    arr2.push({
      ...temp,
      percent: parseFloat((obj[o] * 100) / total2).toFixed(2),
      image: image[o] ? image[o] : "",
    });
  }
  if (filter && filter != "transaction") {
    moneyIn.graphData = arr;
    moneyIn.data = arr2.sort((a, b) => a.percent - b.percent);
  } else {
    let arr = [];
    total2 > total1 &&
      arr.push({
        name: "More than Last Period",
        uv: Math.abs(total2 - total1),
      });
    total2 < total1 &&
      arr.push({
        name: "Less than Last Period",
        uv: Math.abs(total2 - total1),
      });
    arr.push({ name: "Last Period", uv: total1 });
    moneyIn.graphData = arr;
    moneyIn.data = currentTransactions.slice(0,5);
  }

  res.status(200).send({
    success: true,
    moneyOut: moneyIn,
    messaage: "Cash Out Data Fetched Successfully",
  });
});

exports.getCashFlowDataNet = catchAsyncError(async (req, res, next) => {
  const { date, filter } = req.query;
  const obj = {};
  let dateRange;
  if (date == "last_month") {
    dateRange = getTwoMonthRanges(1, 2);
  } else if (date == "last_three_month") {
    dateRange = getTwoMonthRanges(2, 5);
  } else if (date == "last_six_month") {
    dateRange = getTwoMonthRanges(5, 8);
  }
  let previousTransactions = await transactionModel
    .find({
      user: req.userId,
      date: {
        $gt: new Date("2024-08-01"),
        $lte: new Date("2024-08-31"),
      },
    })
    .lean();
  let currentTransactions = await transactionModel
    .find({
      user: req.userId,
      date: {
        $gt: new Date("2024-09-01"),
        $lte: new Date("2024-09-31"),
      },
    })
    .sort({ amount: 1 })
    .populate("category")
    .populate("bucket")
    .populate("tag")
    .lean();

  previousTransactions = previousTransactions.map((tran) => {
    return { ...tran, amount: Math.abs(tran.amount) };
  });
  currentTransactions = currentTransactions.map((tran) => {
    return { ...tran, amount: Math.abs(tran.amount) };
  });

  const image = {};

  const total1 = previousTransactions.reduce((prev, current) => {
    return prev + current.amount;
  }, 0);
  const total2 = currentTransactions.reduce((prev, current) => {
    if (filter) {
      if (filter == "category") {
        if (current.category?.name) {
          if (obj[current.category.name])
            obj[current.category.name] += current.amount;
          else {
            obj[current.category.name] = current.amount;
            image[current.category.name] = current.category.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "bucket") {
        if (current.bucket?.name) {
          if (obj[current.bucket.name])
            obj[current.bucket.name] += current.amount;
          else {
            obj[current.bucket.name] = current.amount;
            image[current.bucket.name] = current.bucket.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "tag") {
        if (current.tag?.tag_name) {
          if (obj[current.tag.tag_name])
            obj[current.tag.tag_name] += current.amount;
          else {
            obj[current.tag.tag_name] = current.amount;
            image[current.tag.tag_name] = current.tag?.image;
          }
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
      if (filter == "merchant") {
        if (current.description) {
          if (
            obj[
              current.description.split("-")[
                current.description.split("-").length - 1
              ]
            ]
          )
            obj[
              current.description.split("-")[
                current.description.split("-").length - 1
              ]
            ] += current.amount;
          else
            obj[
              current.description.split("-")[
                current.description.split("-").length - 1
              ]
            ] = current.amount;
        } else {
          if (obj.others) obj.others += current.amount;
          else obj.others = current.amount;
        }
      }
    }
    return prev + current.amount;
  }, 0);
  const moneyIn = {};
  moneyIn.total = total2;
  moneyIn.last = total1;
  moneyIn.last_period = {
    amount: Math.abs(total1 - total2),
    key: total1 < total2 ? "More than last period" : "Less than last period",
  };
  const arr = [];
  const arr2 = [];
  for (let o in obj) {
    let temp = {};
    temp.name = o;
    temp.value = obj[o];
    arr.push(temp);

    arr2.push({
      ...temp,
      percent: parseFloat((obj[o] * 100) / total2).toFixed(2),
      image: image[o] ? image[o] : "",
    });
  }
  if (filter && filter != "transaction") {
    moneyIn.graphData = arr;
    moneyIn.data = arr2.sort((a, b) => a.percent - b.percent);
  } else {
    let arr = [];
    total2 > total1 &&
      arr.push({
        name: "More than Last Period",
        uv: Math.abs(total2 - total1),
      });
    total2 < total1 &&
      arr.push({
        name: "Less than Last Period",
        uv: Math.abs(total2 - total1),
      });
    arr.push({ name: "Last Period", uv: total1 });
    moneyIn.graphData = arr;
    moneyIn.data = currentTransactions.map((t) => {
      return {
        ...t,
        amount: t.direction == "credit" ? t.amount : t.amount * -1,
      };
    }).slice(0,5);
  }

  res.status(200).send({
    success: true,
    net: moneyIn,
    messaage: "Net Amount Fetched Successfully",
  });
});

exports.updateTransaction = catchAsyncError(async (req, res, next) => {
  const transaction = await transactionModel.findById(req.params.id);
  if (!transaction) return next(new ErrorHandler("Transaction Not Found", 400));
  if (transaction.user.toString() != req.userId) {
    return next(new ErrorHandler("You Don't have Access", 400));
  }
  const { category, tag, bucket, notes, bill } = req.body;
  if (category) transaction.category = category;
  if (bucket) transaction.bucket = bucket;
  if (tag) transaction.tag = tag;
  if (notes) transaction.notes = notes;
  if (category && bill) {
    transaction.bill = true;
    await billModel.create({
      category,
      budget_amount: Math.abs(transaction.amount),
      user: req.userId,
    });
  }
  await transaction.save();
  res.status(200).json({
    success: true,
    message: "Transaction Updated Successfully",
  });
});

exports.getTransactions = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.userId);
  const { keyword, category, date } = req.query;
  const query = {};
  if (keyword) {
    const keywordRegExp = new RegExp(keyword, "i");
    query.description = { $regex: keywordRegExp };
  }
  if (date) {
    query.date = new Date(date);
  }
  if (category) {
    query.category = category;
  }
  const transactions = await transactionModel
    .find({
      user: req.userId,
      account_id: user.account_id,
      ...query,
    })
    .populate("category")
    .populate("bucket")
    .populate("tag")
    .lean();

  res.status(200).json({
    success: true,
    message: "Transactions Fetched Successfully",
    transactions,
  });
});

exports.getTransaction = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.userId);
  const transaction = await transactionModel
    .findById(req.params.id)
    .populate("category")
    .populate("tag")
    .populate("bucket")
    .lean();
  let total = 0;
  const transactions = await transactionModel.find({
    user: req.userId,
    account_id: user.account_id,
    description: transaction.description,
  });
  for (let t of transactions) {
    total += Math.abs(t.amount);
  }
  transaction.total = transactions.length;
  transaction.spend = total;
  transaction.average = Math.round(total / transactions.length);
  res.status(200).json({
    success: true,
    message: "Transaction Fetched Successfully",
    transaction,
  });
});
