const express = require("express");
const { auth } = require("../middlewares/auth");
const { register } = require("../controllers/userController");
const { upload } = require("../utils/s3");
const router = express.Router();

router.post("/register", register);

module.exports = router;