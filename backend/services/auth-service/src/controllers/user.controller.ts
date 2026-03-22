import { Request, Response } from "express";
import { User } from "../models/user.model";

const NAME_REGEX = /^[\p{L}\s'-]+$/u;
function validateName(value: string, fieldLabel: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 2) return `${fieldLabel} phải có ít nhất 2 ký tự`;
  if (trimmed.length > 50) return `${fieldLabel} không được vượt quá 50 ký tự`;
  if (!NAME_REGEX.test(trimmed)) return `${fieldLabel} chỉ được chứa chữ cái, khoảng trắng, dấu gạch ngang`;
  return null;
}

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

    const { firstName, lastName, phone, address, avatar } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName !== undefined) {
      const err = validateName(firstName, "First name");
      if (err) return res.status(400).json({ message: err });
      user.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      const err = validateName(lastName, "Last name");
      if (err) return res.status(400).json({ message: err });
      user.lastName = lastName.trim();
    }
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
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

// ============================================
// STAFF MANAGEMENT BY ORGANIZER (CRUD)
// ============================================

/**
 * POST /api/users/staff
 * Organizer tạo một staff mới
 */
export const createStaff = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).userId;

    if (!organizerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: "Email, password, firstName, lastName là bắt buộc",
      });
    }

    const fnErr = validateName(firstName, "First name");
    if (fnErr) return res.status(400).json({ message: fnErr });
    const lnErr = validateName(lastName, "Last name");
    if (lnErr) return res.status(400).json({ message: lnErr });

    // Check nếu email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Tạo staff mới với companyId = organizerId
    const newStaff = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: "staff",
      companyId: organizerId,
      isActive: true,
    });

    const staffData = await User.findById(newStaff._id).select("-password");

    res.status(201).json({
      message: "Staff được tạo thành công",
      data: staffData,
    });
  } catch (error: any) {
    console.error("❌ Lỗi createStaff:", error);
    res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/users/staff
 * Organizer lấy danh sách tất cả staff của mình
 */
export const getStaffList = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).userId;

    if (!organizerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { page = 1, limit = 10, isActive } = req.query;

    const filter: any = {
      companyId: organizerId,
      role: "staff",
    };

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const staffs = await User.find(filter)
      .select("-password -emailVerificationCode -passwordResetCode")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách staff thành công",
      data: staffs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("❌ Lỗi getStaffList:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/users/staff/:staffId
 * Organizer lấy thông tin chi tiết của một staff
 */
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).userId;
    const { staffId } = req.params;

    if (!organizerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const staff = await User.findById(staffId).select(
      "-password -emailVerificationCode -passwordResetCode"
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Kiểm tra xem staff này có thuộc về organizer không
    if (staff.companyId?.toString() !== organizerId) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập staff này",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy thông tin staff thành công",
      data: staff,
    });
  } catch (error: any) {
    console.error("❌ Lỗi getStaffById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * PATCH /api/users/staff/:staffId
 * Organizer cập nhật thông tin của một staff
 */
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).userId;
    const { staffId } = req.params;
    const { firstName, lastName, phone, email, isActive } = req.body;

    if (!organizerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const staff = await User.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Kiểm tra xem staff này có thuộc về organizer không
    if (staff.companyId?.toString() !== organizerId) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật staff này",
      });
    }

    // Kiểm tra nếu email thay đổi, nó không được trùng với email khác
    if (email && email !== staff.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
      staff.email = email;
    }

    if (firstName !== undefined) {
      const err = validateName(firstName, "First name");
      if (err) return res.status(400).json({ message: err });
      staff.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      const err = validateName(lastName, "Last name");
      if (err) return res.status(400).json({ message: err });
      staff.lastName = lastName.trim();
    }
    if (phone !== undefined) staff.phone = phone;
    if (isActive !== undefined) staff.isActive = isActive;

    await staff.save();

    const updatedStaff = await User.findById(staffId).select(
      "-password -emailVerificationCode -passwordResetCode"
    );

    res.status(200).json({
      success: true,
      message: "Staff được cập nhật thành công",
      data: updatedStaff,
    });
  } catch (error: any) {
    console.error("❌ Lỗi updateStaff:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * DELETE /api/users/staff/:staffId
 * Organizer xóa một staff
 */
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const organizerId = (req as any).userId;
    const { staffId } = req.params;

    if (!organizerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const staff = await User.findById(staffId);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Kiểm tra xem staff này có thuộc về organizer không
    if (staff.companyId?.toString() !== organizerId) {
      return res.status(403).json({
        message: "Bạn không có quyền xóa staff này",
      });
    }

    await User.findByIdAndDelete(staffId);

    res.status(200).json({
      success: true,
      message: "Staff được xóa thành công",
    });
  } catch (error: any) {
    console.error("❌ Lỗi deleteStaff:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * GET /api/users/:userId
 * Public endpoint để lấy thông tin user bằng ID (dùng cho service-to-service calls)
 * Không yêu cầu authentication, nhưng chỉ trả về thông tin cơ bản
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password -emailVerificationCode -passwordResetCode");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("❌ Lỗi getUserById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

/**
 * POST /api/users/send-payout-email
 * Internal endpoint for other services (e.g. Layout Service) 
 * to ask Auth Service to send a payout notification email.
 */
export const sendPayoutEmail = async (req: Request, res: Response) => {
  try {
    const { organizerId, eventName, amount, receiptUrl } = req.body;

    if (!organizerId || !eventName || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (organizerId, eventName, amount)"
      });
    }

    const organizer = await User.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ success: false, message: "Organizer not found" });
    }

    const emailSent = await import("../services/email.service").then(m =>
      m.sendPayoutNotificationEmail({
        to: organizer.email,
        organizerName: `${organizer.firstName} ${organizer.lastName}`,
        eventName,
        amount,
        receiptUrl
      })
    );

    if (emailSent) {
      res.status(200).json({ success: true, message: "Payout notification email sent successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error: any) {
    console.error("❌ Lỗi sendPayoutEmail:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};
