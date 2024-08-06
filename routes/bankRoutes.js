const express = require("express");
const { auth } = require("../middlewares/auth");
const { fetchBank } = require("../controllers/bankController");

const router = express.Router();
router.get("/get-banks", fetchBank);

module.exports = router;
