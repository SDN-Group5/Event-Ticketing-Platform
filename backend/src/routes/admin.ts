import express from "express";
import verifyToken from "../middleware/auth";
import { roleCheck } from "../middleware/roleCheck";

const router = express.Router();

/**
 * Admin Routes
 * Tất cả routes trong này yêu cầu:
 * - verifyToken: User phải đăng nhập
 * - roleCheck(["admin"]): Chỉ admin mới được truy cập
 */

// Áp dụng middleware cho tất cả routes trong router này
router.use(verifyToken);
router.use(roleCheck(["admin"]));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Returns list of all users. Only admin can access.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get("/users", (req, res) => {
  // TODO: Implement get all users controller
  res.status(200).json({ message: "Admin: Get all users (TODO)" });
});

/**
 * @swagger
 * /api/admin/events/approve:
 *   post:
 *     summary: Approve event (Admin only)
 *     description: Admin approves an event. Only admin can access.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Event approved
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post("/events/approve", (req, res) => {
  // TODO: Implement approve event controller
  res.status(200).json({ message: "Admin: Approve event (TODO)" });
});

/**
 * @swagger
 * /api/admin/finance/reports:
 *   get:
 *     summary: Get finance reports (Admin only)
 *     description: Returns financial reports. Only admin can access.
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Finance reports
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get("/finance/reports", (req, res) => {
  // TODO: Implement finance reports controller
  res.status(200).json({ message: "Admin: Finance reports (TODO)" });
});

export default router;
