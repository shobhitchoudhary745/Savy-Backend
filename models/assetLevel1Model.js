const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    asset_liabilty_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetLiability",
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("AssetLiabilityLevel1", Schema);
