const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");

const { upload } = require("../utils/s3");
const {
  createAssetLevel1,
  getAssetsLevel1,
  getAssetLevel1,
  updateAssetLevel1,
  deleteAssetLevel1,
} = require("../controllers/assetLevel1Controller");

const router = express.Router();
router.post(
  "/create-asset",
  auth,
  isAdmin,
  upload.single("image"),
  createAssetLevel1
);
router.get("/get-assets", getAssetsLevel1);
router.get("/get-asset/:id", getAssetLevel1);
router.patch(
  "/update-asset/:id",
  auth,
  isAdmin,
  upload.single("image"),
  updateAssetLevel1
);
router.delete("/delete-asset/:id", auth, isAdmin, deleteAssetLevel1);

module.exports = router;
