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
    is_bill: {
      type: Boolean,
      default: false,
    },
    payday: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payday",
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

module.exports = mongoose.model("Budget", Schema);
