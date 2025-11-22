const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create default admin if not exists
    await createDefaultAdmin();
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require("../models/User");
    const Admin = require("../models/Admin");

    const existingAdmin = await User.findOne({
      email: "admin@bloodconnect.com",
    });
    if (!existingAdmin) {
      const adminUser = await User.create({
        email: "admin@bloodconnect.com",
        password: "admin123",
        role: "admin",
      });

      await Admin.create({
        user: adminUser._id,
        name: "System Administrator",
      });

      console.log("✅ Default admin account created");
      console.log("📧 Email: admin@bloodconnect.com");
      console("🔑 Password: admin123");
    }
  } catch (error) {
    console.log("⚠️ Default admin setup skipped:", error.message);
  }
};

module.exports = connectDB;
