const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: 500,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ hospital: 1, createdAt: -1 });
reviewSchema.index({ patient: 1, hospital: 1 }, { unique: true });

reviewSchema.post("save", async function () {
  // Update hospital average rating
  const Hospital = mongoose.model("Hospital");
  const reviews = await mongoose.model("Review").find({
    hospital: this.hospital,
    isApproved: true,
  });

  if (reviews.length > 0) {
    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
    await Hospital.findByIdAndUpdate(this.hospital, { averageRating });
  }
});

module.exports = mongoose.model("Review", reviewSchema);
