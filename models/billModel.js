const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    budget_amount: {
      type: Number,
    },
    payday: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payday",
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

module.exports = mongoose.model("Bill", schema);
