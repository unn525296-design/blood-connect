const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: 18,
      max: 65,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: [true, "Blood group is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    lastDonationDate: {
      type: Date,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    healthConditions: {
      type: [String],
      default: [],
    },
    canTravel: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

donorSchema.index({ city: 1, area: 1, country: 1 });
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ isAvailable: 1 });
donorSchema.index({ country: 1 });

module.exports = mongoose.model("Donor", donorSchema);
