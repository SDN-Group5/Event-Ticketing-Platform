/**
 * Script để reset password cho manager
 * Chạy: npx ts-node backend/scripts/reset-manager-password.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";
import User from "../src/models/user";

const resetManagerPassword = async () => {
  try {
    // Kết nối database
    const mongoUri = process.env.MONGODB_CONNECTION_STRING;
    if (!mongoUri) {
      console.error("❌ MONGODB_CONNECTION_STRING không được tìm thấy trong .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Đã kết nối database");

    // Tìm manager
    const managerEmail = "manager@gmail.com";
    const manager = await User.findOne({ email: managerEmail });

    if (!manager) {
      console.error(`❌ Không tìm thấy user với email: ${managerEmail}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Tìm thấy manager: ${manager.firstName} ${manager.lastName}`);
    console.log(`   Role: ${manager.role}`);
    console.log(`   ID: ${manager._id}`);

    // Reset password mới
    const newPassword = "manager123"; // Password mới
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    await User.findByIdAndUpdate(manager._id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    console.log("\n✅ Đã reset password thành công!");
    console.log(`📧 Email: ${managerEmail}`);
    console.log(`🔑 Password mới: ${newPassword}`);
    console.log("\n⚠️  Lưu ý: Hãy đổi password sau khi đăng nhập!");

    await mongoose.disconnect();
    console.log("\n✅ Đã ngắt kết nối database");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

resetManagerPassword();




