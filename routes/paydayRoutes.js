const express = require("express");

const { auth } = require("../middlewares/auth");
const {
  createPayday,
  getPaydays,
  getPayday,
  updatePayday,
  deletePayday,
} = require("../controllers/paydayController");

const router = express.Router();
router.post("/create-payday", auth, createPayday);
router.get("/get-paydays", getPaydays);
router.get("/get-payday/:id", getPayday);
router.patch("/update-payday/:id", auth, updatePayday);
router.delete("/delete-payday/:id", auth, deletePayday);

module.exports = router;
