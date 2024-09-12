const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Bucket", Schema);
