const express = require("express");
const cors = require("cors");
const app = express();
const { error } = require("./middlewares/error");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");

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

app.get("/", (req, res) =>
  res.send(`<h1>Its working. Click to visit Link.</h1>`)
);

app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;

app.use(error);
