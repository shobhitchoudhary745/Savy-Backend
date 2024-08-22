const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    description: {
      type: String,
    },
    amount: {
      type: Number,
    },
    date: {
      type: Date,
    },
    image: {
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

module.exports = mongoose.model("Goal", Schema);
