import { Request, Response } from "express";
import { User } from "../models/user.model";

/**
 * GET /api/users/me
 * Lấy thông tin user hiện tại (đã đăng nhập)
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password");

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
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
