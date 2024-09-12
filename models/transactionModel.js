const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    accpunt_no: {
      type: String,
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
    },
    direction: {
      type: String,
    },
    date: {
      type: Date,
    },
    tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
    bucket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bucket",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", Schema);
