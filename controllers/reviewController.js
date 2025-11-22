const Review = require("../models/Review");
const Hospital = require("../models/Hospital");
const Patient = require("../models/Patient");

// @desc    Create review
// @route   POST /api/reviews
// @access  Private/Patient
exports.createReview = async (req, res) => {
  try {
    const { hospitalId, rating, comment } = req.body;

    // Validation
    if (!hospitalId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide hospital ID, rating, and comment",
      });
    }

    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Check if patient has already reviewed this hospital
    const existingReview = await Review.findOne({
      patient: req.user.id,
      hospital: hospitalId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this hospital",
      });
    }

    // Create review
    const review = await Review.create({
      patient: req.user.id,
      hospital: hospitalId,
      rating,
      comment,
    });

    await review.populate("patient", "name");
    await review.populate("hospital", "name");

    res.status(201).json({
      success: true,
      data: review,
      message: "Review submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get reviews for a hospital
// @route   GET /api/reviews/hospital/:hospitalId
// @access  Public
exports.getHospitalReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      hospital: req.params.hospitalId,
      isApproved: true,
    })
      .populate("patient", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get patient's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private/Patient
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user.id })
      .populate("hospital", "name address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all reviews (for admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("patient", "name")
      .populate("hospital", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle review approval
// @route   PATCH /api/reviews/:reviewId/approval
// @access  Private/Admin
exports.toggleReviewApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
      message: `Review ${review.isApproved ? "approved" : "unapproved"}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:reviewId
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
