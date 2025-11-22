const express = require("express");
const {
  searchDonors,
  getAllDonors,
  getDonorProfile,
  updateDonorProfile,
  toggleAvailability,
} = require("../controllers/donorController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get("/search", searchDonors);
router.get("/", protect, authorize("admin"), getAllDonors);
router.get("/profile", protect, authorize("donor"), getDonorProfile);
router.put("/profile", protect, authorize("donor"), updateDonorProfile);
router.patch("/availability", protect, authorize("donor"), toggleAvailability);

module.exports = router;
