const express = require("express");
const {
  getAllPatients,
  getPatientProfile,
  updatePatientProfile,
} = require("../controllers/patientController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllPatients);
router.get("/profile", protect, authorize("patient"), getPatientProfile);
router.put("/profile", protect, authorize("patient"), updatePatientProfile);

module.exports = router;
