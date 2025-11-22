const mongoose = require("mongoose");

const bloodUnitSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true,
  },
  units: {
    type: Number,
    default: 0,
    min: 0,
  },
  criticalLevel: {
    type: Number,
    default: 5,
  },
});

const hospitalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
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
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },
    availableBloodUnits: [bloodUnitSchema],
    emergencyContact: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

hospitalSchema.index({ city: 1, area: 1, country: 1 });
hospitalSchema.index({ "availableBloodUnits.units": 1 });
hospitalSchema.index({ country: 1 });

hospitalSchema.methods.getCriticalBloodGroups = function () {
  return this.availableBloodUnits.filter(
    (unit) => unit.units <= unit.criticalLevel
  );
};

module.exports = mongoose.model("Hospital", hospitalSchema);
