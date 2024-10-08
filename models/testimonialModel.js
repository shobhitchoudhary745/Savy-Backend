const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    profile: {
      type: String,
    },
    message: {
      type: String,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", Schema);
