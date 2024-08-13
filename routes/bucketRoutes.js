const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  createBucket,
  getBuckets,
  getBucket,
  updateBucket,
  deleteBucket,
} = require("../controllers/bucketController");

const router = express.Router();
router.post("/create-bucket", auth, isAdmin, createBucket);
router.get("/get-buckets", getBuckets);
router.get("/get-bucket/:id", getBucket);
router.patch("/update-bucket/:id", auth, isAdmin, updateBucket);
router.delete("/delete-bucket/:id", auth, isAdmin, deleteBucket);

module.exports = router;
