const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    pay_date: {
      type: Date,
    },
    pay_period: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    source: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payday", Schema);
