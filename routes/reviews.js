const express = require("express");
const {
  createReview,
  getHospitalReviews,
  getMyReviews,
  getAllReviews,
  toggleReviewApproval,
  deleteReview,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.post("/", protect, authorize("patient"), createReview);
router.get("/hospital/:hospitalId", getHospitalReviews);
router.get("/my-reviews", protect, authorize("patient"), getMyReviews);
router.get("/", protect, authorize("admin"), getAllReviews);
router.patch(
  "/:reviewId/approval",
  protect,
  authorize("admin"),
  toggleReviewApproval
);
router.delete("/:reviewId", protect, authorize("admin"), deleteReview);

module.exports = router;
