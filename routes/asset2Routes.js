const express = require("express");

const { auth, isAdmin } = require("../middlewares/auth");

const { upload } = require("../utils/s3");
const {
  createAssetLevel2,
  getAssetsLevel2,
  getAssetLevel2,
  updateAssetLevel2,
  deleteAssetLevel2,
} = require("../controllers/assetLevel2Controller");

const router = express.Router();
router.post(
  "/create-asset",
  auth,
  isAdmin,
  upload.single("image"),
  createAssetLevel2
);
router.get("/get-assets", getAssetsLevel2);
router.get("/get-asset/:id", getAssetLevel2);
router.patch(
  "/update-asset/:id",
  auth,
  isAdmin,
  upload.single("image"),
  updateAssetLevel2
);
router.delete("/delete-asset/:id", auth, isAdmin, deleteAssetLevel2);

module.exports = router;
