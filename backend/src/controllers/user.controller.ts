import { Request, Response } from "express";
import User from "../models/user";

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
