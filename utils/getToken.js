const API_KEY = process.env.BASIC_API;
const axios = require("axios");
const getToken = () => {
  return new Promise(async (resolve, reject) => {
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://au-api.basiq.io/token",
      headers: {
        Authorization: `Basic ${API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "basiq-version": "3.0",
      },
      data: { scope: "SERVER_ACCESS" },
    };
    try {
      const { data } = await axios(config);
      resolve(data.access_token);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = getToken;
