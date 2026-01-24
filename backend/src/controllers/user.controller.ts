import { Request, Response } from "express";
import User from "../models/user";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Configure multer for memory storage (không lưu file vào disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh"));
    }
  },
});

// Error handler cho multer - phải có 4 params để Express nhận diện là error handler
export const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File quá lớn. Tối đa 5MB." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || "Lỗi upload file" });
  }
  next();
};

/**
 * GET /api/users/me
 * Lấy thông tin user hiện tại (đã đăng nhập)
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password"); // Không trả về password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Lỗi getCurrentUser:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * PATCH /api/users/me
 * User tự update thông tin profile của mình
 */
export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update các field được phép
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) {
      user.address = {
        ...user.address,
        ...address,
      } as any;
    }

    await user.save();

    // Trả về user đã update (không có password)
    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Lỗi updateCurrentUser:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * PATCH /api/users/me/avatar
 * Upload avatar lên Cloudinary và update vào user profile
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    console.log("📸 uploadAvatar called");
    const userId = req.userId;

    if (!userId) {
      console.log("❌ No userId found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("📸 User ID:", userId);
    console.log("📸 File:", req.file ? `Present (${req.file.size} bytes, ${req.file.mimetype})` : "Missing");

    // Kiểm tra có file không
    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({ message: "Không có file ảnh được upload" });
    }

    // Kiểm tra Cloudinary đã được config chưa
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ message: "Cloudinary chưa được cấu hình" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Chuyển buffer thành base64
    const b64 = req.file.buffer.toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Upload lên Cloudinary
    console.log("☁️ Uploading to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "ticketvibe/avatars", // Tổ chức ảnh vào folder
      public_id: `user_${userId}`, // Tên file = user ID (sẽ overwrite nếu đã có)
      overwrite: true, // Ghi đè nếu đã có
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" }, // Crop ảnh vuông 400x400, focus vào mặt
        { quality: "auto" }, // Tự động optimize chất lượng
        { format: "auto" }, // Tự động chọn format tốt nhất (webp nếu có thể)
      ],
    });

    console.log("✅ Cloudinary upload success:", uploadResult.secure_url);

    // Update avatar URL vào database
    (user as any).avatar = uploadResult.secure_url; // Dùng secure_url (HTTPS)
    await user.save();
    console.log("✅ Avatar saved to database");

    // Trả về user đã update (không có password)
    const updatedUser = await User.findById(userId).select("-password");

    console.log("✅ Upload avatar completed successfully");
    res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: uploadResult.secure_url,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Lỗi uploadAvatar:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Export multer middleware để dùng trong routes
export const uploadAvatarMiddleware = upload.single("avatar");
