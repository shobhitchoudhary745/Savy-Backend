const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    company: {
      type: String,
    },
    email: {
      type: String,
    },
    message: {
      type: String,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Query", Schema);
