const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
  {
    tag_name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "role",
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "User"],
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tag", TagSchema);
