const Hospital = require("../models/Hospital");

// @desc    Search hospitals
// @route   GET /api/hospitals/search
// @access  Public
exports.searchHospitals = async (req, res) => {
  try {
    const { city, area, bloodGroup, country } = req.query;

    let query = {};

    // Build search query
    if (city) query.city = new RegExp(city, "i");
    if (area) query.area = new RegExp(area, "i");
    if (country) query.country = new RegExp(country, "i");

    let hospitals = await Hospital.find(query)
      .populate("user", "email")
      .select("-__v")
      .sort({ createdAt: -1 });

    // Filter by blood group if specified
    if (bloodGroup) {
      hospitals = hospitals.filter((hospital) =>
        hospital.availableBloodUnits.some(
          (unit) => unit.bloodGroup === bloodGroup && unit.units > 0
        )
      );
    }

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all hospitals (for admin)
// @route   GET /api/hospitals
// @access  Private/Admin
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .populate("user", "email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get hospital profile
// @route   GET /api/hospitals/profile
// @access  Private/Hospital
exports.getHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ user: req.user.id }).populate(
      "user",
      "email"
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update hospital profile
// @route   PUT /api/hospitals/profile
// @access  Private/Hospital
exports.updateHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "email");

    res.status(200).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update blood units
// @route   PATCH /api/hospitals/blood-units
// @access  Private/Hospital
exports.updateBloodUnits = async (req, res) => {
  try {
    const { bloodGroup, units } = req.body;

    if (!bloodGroup || units === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide blood group and units",
      });
    }

    const hospital = await Hospital.findOne({ user: req.user.id });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    const bloodUnit = hospital.availableBloodUnits.find(
      (unit) => unit.bloodGroup === bloodGroup
    );

    if (!bloodUnit) {
      return res.status(404).json({
        success: false,
        message: "Blood group not found",
      });
    }

    bloodUnit.units = Math.max(0, units); // Ensure non-negative
    await hospital.save();

    res.status(200).json({
      success: true,
      data: hospital,
      message: `Blood units for ${bloodGroup} updated to ${units}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
