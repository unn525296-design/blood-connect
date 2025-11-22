const User = require("../models/User");
const Patient = require("../models/Patient");
const Donor = require("../models/Donor");
const Hospital = require("../models/Hospital");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, password, and role",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
    });

    // Create profile based on role. Make profile creation atomic: if it fails,
    // remove the created user to avoid orphaned users and duplicate-email issues.
    try {
      let profile;
      switch (role) {
        case "patient":
          profile = await Patient.create({
            user: user._id,
            ...profileData,
          });
          break;
        case "donor":
          profile = await Donor.create({
            user: user._id,
            ...profileData,
          });
          break;
        case "hospital":
          profile = await Hospital.create({
            user: user._id,
            ...profileData,
            availableBloodUnits: [
              { bloodGroup: "A+", units: 0 },
              { bloodGroup: "A-", units: 0 },
              { bloodGroup: "B+", units: 0 },
              { bloodGroup: "B-", units: 0 },
              { bloodGroup: "AB+", units: 0 },
              { bloodGroup: "AB-", units: 0 },
              { bloodGroup: "O+", units: 0 },
              { bloodGroup: "O-", units: 0 },
            ],
          });
          break;
        default:
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: "Invalid role specified",
          });
      }
    } catch (profileError) {
      // Clean up the created user to avoid partial registration
      try {
        await User.findByIdAndDelete(user._id);
      } catch (cleanupErr) {
        // log cleanup error but return original profile creation error
        console.error("Failed to cleanup user after profile error:", cleanupErr);
      }

      // If this is a Mongoose validation error, return 400 with helpful message
      const msg = profileError && profileError.message ? profileError.message : "Profile creation failed";
      return res.status(400).json({ success: false, message: msg });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact admin.",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    let profile;
    const user = await User.findById(req.user.id);

    switch (user.role) {
      case "patient":
        profile = await Patient.findOne({ user: user._id });
        break;
      case "donor":
        profile = await Donor.findOne({ user: user._id });
        break;
      case "hospital":
        profile = await Hospital.findOne({ user: user._id });
        break;
      case "admin":
        profile = await Admin.findOne({ user: user._id });
        break;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let profile;

    switch (user.role) {
      case "patient":
        profile = await Patient.findOneAndUpdate({ user: user._id }, req.body, {
          new: true,
          runValidators: true,
        });
        break;
      case "donor":
        profile = await Donor.findOneAndUpdate({ user: user._id }, req.body, {
          new: true,
          runValidators: true,
        });
        break;
      case "hospital":
        profile = await Hospital.findOneAndUpdate(
          { user: user._id },
          req.body,
          { new: true, runValidators: true }
        );
        break;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
