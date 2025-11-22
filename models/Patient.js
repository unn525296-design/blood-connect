const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
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
      required: false,
      min: 1,
      max: 120,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: false,
    },
    city: {
      type: String,
      required: false,
      trim: true,
    },
    area: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

patientSchema.index({ city: 1, area: 1 });
patientSchema.index({ bloodGroup: 1 });

module.exports = mongoose.model("Patient", patientSchema);
