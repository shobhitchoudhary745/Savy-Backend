const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    budget_amount: {
      type: Number,
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", Schema);
