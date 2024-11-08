const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    type: {
      type: String,
    },
    essential: {
      type: Boolean,
    },
    in_out:{

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

  { timestamps: true }
);

module.exports = mongoose.model("TipTopic", Schema);
