const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");
const {
  createBucket,
  getBuckets,
  getBucket,
  updateBucket,
  deleteBucket,
  getBucketList,
} = require("../controllers/bucketController");

const router = express.Router();
router.post("/create-bucket", auth, isAdmin, createBucket);
router.get("/get-buckets", getBuckets);
router.get("/get-bucket/:id", getBucket);
router.patch("/update-bucket/:id", auth, isAdmin, updateBucket);
router.delete("/delete-bucket/:id", auth, isAdmin, deleteBucket);
router.get("/get-bucket-list", auth, isAdmin, getBucketList);

module.exports = router;
