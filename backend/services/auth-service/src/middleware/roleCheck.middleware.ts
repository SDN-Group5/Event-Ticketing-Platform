import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";

/**
 * MIDDLEWARE: roleCheck
 * MỤC ĐÍCH: Kiểm tra quyền truy cập dựa trên role của user
 * SỬ DỤNG: roleCheck(['customer', 'organizer', 'staff', 'admin'])
 */
export const roleCheck = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Lấy userId từ request (đã được set bởi verifyToken middleware)
      const userId = (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Không tìm thấy thông tin người dùng" });
      }

      // Lấy thông tin user từ database
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(401).json({ message: "Không tìm thấy người dùng" });
      }

      // Kiểm tra user có đang active không
      if (user.isActive === false) {
        return res.status(403).json({ 
          message: "Tài khoản của bạn đã bị vô hiệu hóa" 
        });
      }

      // Kiểm tra role
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          message: "Bạn không có quyền truy cập chức năng này",
          requiredRoles: allowedRoles,
          userRole: user.role
        });
      }

      // Lưu user info vào request để dùng ở controller
      (req as any).user = user;
      (req as any).userRole = user.role;

      next();
    } catch (error) {
      console.error("Lỗi roleCheck middleware:", error);
      res.status(500).json({ message: "Lỗi kiểm tra quyền truy cập" });
    }
  };
};

/**
 * Helper functions để check role cụ thể
 */
export const isCustomer = roleCheck(["customer"]);
export const isOrganizer = roleCheck(["organizer"]);
export const isStaff = roleCheck(["staff"]);
export const isAdmin = roleCheck(["admin"]);
export const isOrganizerOrAdmin = roleCheck(["organizer", "admin"]);
export const isStaffOrAdmin = roleCheck(["staff", "admin"]);
