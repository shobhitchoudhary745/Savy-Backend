const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    image_url: {
      type: String,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Blog", Schema);
