const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    bucket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bucket",
    },
    image: {
      type: String,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Category", Schema);
