const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Schema = new mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    code: {
      type: String,
    },
    mobile: {
      type: String,
    },
    profile_url: {
      type: String,
      default: "/test/1717483821163-user.jfif",
    },
    otp: {
      type: Number,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    customer_id: {
      type: String,
    },
  },

  { timestamps: true }
);

Schema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 11);
});

Schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

Schema.methods.getJWTToken = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET);
};

module.exports = mongoose.model("User", Schema);
