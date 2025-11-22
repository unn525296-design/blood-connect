const Patient = require("../models/Patient");

// @desc    Get all patients (for admin)
// @route   GET /api/patients
// @access  Private/Admin
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("user", "email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private/Patient
exports.getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate(
      "user",
      "email"
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private/Patient
exports.updatePatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "email");

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
