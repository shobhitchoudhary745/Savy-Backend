const express = require("express");
const cors = require("cors");
const app = express();
const { error } = require("./middlewares/error");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const nodeMailer = require("nodemailer");
const getToken = require("./utils/getToken");

dotenv.config({
  path: "./config/config.env",
});

app.use(helmet());
app.use(morgan("tiny"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const bankRoutes = require("./routes/bankRoutes");
const queryRoutes = require("./routes/queryRoutes");
const blogRoutes = require("./routes/blogRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const faqRoutes = require("./routes/faqRoutes");
const bucketRoutes = require("./routes/bucketRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const paydayRoutes = require("./routes/paydayRoutes");
const billRoutes = require("./routes/billRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const goalRoutes = require("./routes/goalRoutes");
const planRoutes = require("./routes/planRoutes");
const pageRoutes = require("./routes/pageRoutes");
const tagRoutes = require("./routes/tagRoutes");
const userModel = require("./models/userModel");
const axios = require("axios");
const transactionModel = require("./models/transactionModel");

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/bucket", bucketRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/payday", paydayRoutes);
app.use("/api/bill", billRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/page", pageRoutes);
app.use("/api/tag", tagRoutes);

app.get("/", (req, res) =>
  res.send(`<h1>Its working. Click to visit Link.</h1>`)
);

app.post("/consent-form", async (req, res) => {
  const event = req.body;

  if (event.eventTypeId === "consent.created") {
    try {
      const token = await getToken();
      const url = event.links.eventEntity;
      const parts = url.split("/");
      const userId = parts[4];
      const user = await userModel.findOne({ customer_id: userId });
      const { data: account } = await axios.get(
        `https://au-api.basiq.io/users/${userId}/accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      user.user_name = account.data[0].accountHolder;
      user.account_id = account.data[0].id;
      user.amount = account.data[0].balance;
      user.credit_card = account.data[0].creditLimit || 0;
      const { data: transactions } = await axios.get(
        `https://au-api.basiq.io/users/${user.customer_id}/transactions?filter=account.id.eq('${account.data[0].id}')`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const transaction = transactions.data.map((trans) => {
        return {
          description: trans.description,
          amount: Number(trans.amount),
          direction: trans.direction,
          time: trans.postDate,
          account_id: account.data[0].id,
          user: user._id,
        };
      });
      await transactionModel.insertMany(transaction);

      user.is_verified = true;
      await user.save();
      res.status(200).json({});
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
        subject: "options.subject",
        text: JSON.stringify(error),
      });
      res.status(400).json({});
    }
  }
});

app.post("/transaction-updated", async (req, res) => {
  try {
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
      subject: "options.subject",
      text: JSON.stringify(req.body),
    });
    res.status(200).json({});
  } catch (error) {
    res.status(400).json({});
  }
});

app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;

app.use(error);

var obj = {
  eventId: "4dd9c158dcc15c78481ad0f67422fb5249e3c9f3c99829f7cbde7c1f74adbbda",
  eventTypeId: "transactions.updated",
  links: {
    event:
      "https://au-api.basiq.io/events/4dd9c158dcc15c78481ad0f67422fb5249e3c9f3c99829f7cbde7c1f74adbbda",
    eventEntity:
      "https://au-api.basiq.io/users/436ee38c-453f-4c0d-98dd-c2fd4a273caa/transactions",
  },
};
