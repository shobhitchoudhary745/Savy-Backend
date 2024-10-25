const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");

const { upload } = require("../utils/s3");
const {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
} = require("../controllers/assetController");

const router = express.Router();
router.post(
  "/create-asset",
  auth,
  isAdmin,
  upload.single("image"),
  createAsset
);
router.get("/get-assets", getAssets);
router.get("/get-asset/:id", getAsset);
router.patch(
  "/update-asset/:id",
  auth,
  isAdmin,
  upload.single("image"),
  updateAsset
);
router.delete("/delete-asset/:id", auth, isAdmin, deleteAsset);

module.exports = router;
