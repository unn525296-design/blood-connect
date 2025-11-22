const User = require("../models/User");
const Patient = require("../models/Patient");
const Donor = require("../models/Donor");
const Hospital = require("../models/Hospital");
const Review = require("../models/Review");

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDonors,
      totalHospitals,
      totalReviews,
      activeDonors,
      criticalBloodUnits,
    ] = await Promise.all([
      Patient.countDocuments(),
      Donor.countDocuments(),
      Hospital.countDocuments(),
      Review.countDocuments(),
      Donor.countDocuments({ isAvailable: true }),
      Hospital.aggregate([
        { $unwind: "$availableBloodUnits" },
        {
          $match: {
            "availableBloodUnits.units": { $lte: 5 },
          },
        },
        { $count: "count" },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDonors,
        totalHospitals,
        totalReviews,
        activeDonors,
        criticalBloodUnits: criticalBloodUnits[0]?.count || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:userId/status
// @access  Private/Admin
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete associated profile based on role
    switch (user.role) {
      case "patient":
        await Patient.findOneAndDelete({ user: user._id });
        break;
      case "donor":
        await Donor.findOneAndDelete({ user: user._id });
        break;
      case "hospital":
        await Hospital.findOneAndDelete({ user: user._id });
        break;
    }

    // Delete user
    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get activity logs (simplified)
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
exports.getActivityLogs = async (req, res) => {
  try {
    // In a real application, you would have a separate ActivityLog model
    // For now, we'll return recent activities from different collections
    const recentPatients = await Patient.find()
      .populate("user", "email")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentDonors = await Donor.find()
      .populate("user", "email")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentHospitals = await Hospital.find()
      .populate("user", "email")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentReviews = await Review.find()
      .populate("patient", "name")
      .populate("hospital", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const activityLogs = [
      ...recentPatients.map((p) => ({
        type: "PATIENT_REGISTER",
        message: `New patient registered: ${p.name}`,
        timestamp: p.createdAt,
      })),
      ...recentDonors.map((d) => ({
        type: "DONOR_REGISTER",
        message: `New donor registered: ${d.name}`,
        timestamp: d.createdAt,
      })),
      ...recentHospitals.map((h) => ({
        type: "HOSPITAL_REGISTER",
        message: `New hospital registered: ${h.name}`,
        timestamp: h.createdAt,
      })),
      ...recentReviews.map((r) => ({
        type: "REVIEW_SUBMITTED",
        message: `New review submitted for ${r.hospital.name}`,
        timestamp: r.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    res.status(200).json({
      success: true,
      count: activityLogs.length,
      data: activityLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
