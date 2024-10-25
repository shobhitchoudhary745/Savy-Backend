const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    type: {
      type: String,
      enum: ["Asset", "Liability"],
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("AssetLiability", Schema);
