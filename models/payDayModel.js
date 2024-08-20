const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    pay_date: {
      type: Date,
    },
    pay_period: {
      type: String,
    },
    amount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payday", schema);
