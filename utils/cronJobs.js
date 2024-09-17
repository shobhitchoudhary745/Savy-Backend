const cron = require("node-cron");
const userModel = require("../models/userModel");
const getToken = require("./getToken");
const transactionModel = require("../models/transactionModel");
const axios = require("axios");
const nodeMailer = require("nodemailer");

cron.schedule("*/30 * * * *", async () => {
  try {
    const token = await getToken();
    const users = await userModel.find({ is_verified: true }).lean();
    for (const user of users) {
      await axios.post(
        `https://au-api.basiq.io/users/${user.customer_id}/connections/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const { data: transactions } = await axios.get(
        `https://au-api.basiq.io/users/${user.customer_id}/transactions?filter=account.id.eq('${user.account_id}')`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const transactionCount = await transactionModel.countDocuments({
        user: user._id,
        account_id: user.account_id,
      });

      if (transactionCount < transactions.data.length) {
        const transaction = transactions.data.reverse()
          .slice(transactionCount)
          .map((trans) => {
            return {
              description: trans.description,
              amount: Number(trans.amount),
              direction: trans.direction,
              date: new Date(trans.postDate),
              account_id: user.account_id,
              user: user._id,
            };
          });
        await transactionModel.insertMany(transaction);
      }
    }

    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "Keep It Going <keepitgoingstory@gmail.com>",
      to: "shobhitchoudhary745@gmail.com",
      subject: "optionssubject",
      text: "Success",
    });
  } catch (error) {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "Keep It Going <keepitgoingstory@gmail.com>",
      to: "shobhitchoudhary745@gmail.com",
      subject: "optionssubject",
      text: JSON.stringify(error),
    });
  }
});
