const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    plan_name: {
      type: String,
      unique: true,
    },
    tag_line: {
      type: String,
    },
    annual_price: {
      type: Number,
    },
    monthly_price: {
      type: Number,
    },
    features: {
      title: {
        type: String,
      },
      available_features: [{ type: String }],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
    },
    plan_type: {
      type: String,
      enum: ["Paid", "Free"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", Schema);
