import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserType } from "../shared/types";

const userSchema = new mongoose.Schema(
  {
    companyId: { type: String, index: true }, // ✅ THÊM: ID công ty (optional - có thể null cho customer)
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    // New fields for better user management
    role: {
      type: String,
      enum: ["customer", "organizer", "staff", "admin"], // Event Ticketing Platform roles
      default: "customer",
    },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    preferences: {
      preferredDestinations: [String],
      preferredHotelTypes: [String],
      budgetRange: {
        min: Number,
        max: Number,
      },
    },
    // Analytics and tracking fields
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
    // Email verification (OTP)
    emailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    // Password reset (OTP)
    passwordResetCode: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    // Audit fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

// Mongoose tự động chuyển "User" → collection "users" (số nhiều)
// Nhưng để rõ ràng, mình chỉ định collection name là "users"
const User = mongoose.model<UserType>("User", userSchema, "users");

export default User;
