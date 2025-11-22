const express = require("express");
const {
  searchHospitals,
  getAllHospitals,
  getHospitalProfile,
  updateHospitalProfile,
  updateBloodUnits,
} = require("../controllers/hospitalController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get("/search", searchHospitals);
router.get("/", protect, authorize("admin"), getAllHospitals);
router.get("/profile", protect, authorize("hospital"), getHospitalProfile);
router.put("/profile", protect, authorize("hospital"), updateHospitalProfile);
router.patch("/blood-units", protect, authorize("hospital"), updateBloodUnits);

module.exports = router;
