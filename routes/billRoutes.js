const express = require("express");

const { auth } = require("../middlewares/auth");
const { createBill, getBills, getBill, updateBill, deleteBill } = require("../controllers/billController");

const router = express.Router();
router.post("/create-bill", auth, createBill);
router.get("/get-bills", auth, getBills);
router.get("/get-bill/:id", auth, getBill);
router.patch("/update-bill/:id", auth, updateBill);
router.delete("/delete-bill/:id", auth, deleteBill);

module.exports = router;
