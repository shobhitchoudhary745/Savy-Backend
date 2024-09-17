const API_KEY = process.env.BASIC_API;
const axios = require("axios");
const getToken = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.post(
        "https://au-api.basiq.io/token",
        {
          scope: "SERVER_ACCESS",
        },
        {
          headers: {
            Authorization: `Basic ${process.env.BASIC_API}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "basiq-version": "3.0",
          },
        }
      );

      resolve(data.access_token);
    } catch (error) {
      reject();
    }
  });
};

module.exports = getToken;
