const axios = require("axios");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const getToken = require("../utils/getToken");
const API_KEY = process.env.BASIC_API;
const BASE_URL = process.env.BASE_URL;

exports.fetchBank = catchAsyncError(async (req, res, next) => {
  const token = await getToken();
  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${BASE_URL}/institutions`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };

  const { data } = await axios(config);

  res.status(200).send({
    success: true,
    message: "Bank details Fetched Successfully",
    data,
  });
});
