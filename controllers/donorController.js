const Donor = require("../models/Donor");
const User = require("../models/User");

// @desc    Search donors
// @route   GET /api/donors/search
// @access  Public
exports.searchDonors = async (req, res) => {
  try {
    const { city, area, bloodGroup, country, minAge, maxAge } = req.query;

    let query = { isAvailable: true };

    // Build search query
    if (city) query.city = new RegExp(city, "i");
    if (area) query.area = new RegExp(area, "i");
    if (country) query.country = new RegExp(country, "i");
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }

    const donors = await Donor.find(query)
      .populate("user", "email")
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all donors (for admin)
// @route   GET /api/donors
// @access  Private/Admin
exports.getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate("user", "email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get donor profile
// @route   GET /api/donors/profile
// @access  Private/Donor
exports.getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id }).populate(
      "user",
      "email"
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donors/profile
// @access  Private/Donor
exports.updateDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "email");

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle donor availability
// @route   PATCH /api/donors/availability
// @access  Private/Donor
exports.toggleAvailability = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor profile not found",
      });
    }

    donor.isAvailable = !donor.isAvailable;
    await donor.save();

    res.status(200).json({
      success: true,
      data: donor,
      message: `Availability updated to ${donor.isAvailable}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
