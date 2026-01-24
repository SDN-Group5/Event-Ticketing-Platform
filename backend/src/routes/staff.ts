import express from "express";
import verifyToken from "../middleware/auth";
import { roleCheck } from "../middleware/roleCheck";

const router = express.Router();

/**
 * Staff Routes
 * Tất cả routes trong này yêu cầu:
 * - verifyToken: User phải đăng nhập
 * - roleCheck(["staff"]): Chỉ staff mới được truy cập
 */

// Áp dụng middleware cho tất cả routes trong router này
router.use(verifyToken);
router.use(roleCheck(["staff"]));

/**
 * @swagger
 * /api/staff/checkin:
 *   post:
 *     summary: Check-in ticket (Staff only)
 *     description: Staff checks in a ticket by scanning QR code. Only staff can access.
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Ticket checked in successfully
 *       403:
 *         description: Forbidden - Not a staff
 */
router.post("/checkin", (req, res) => {
  // TODO: Implement check-in controller
  res.status(200).json({ message: "Staff: Check-in ticket (TODO)" });
});

/**
 * @swagger
 * /api/staff/scan-qr:
 *   post:
 *     summary: Scan QR code (Staff only)
 *     description: Staff scans QR code to verify ticket. Only staff can access.
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: QR code verified
 *       403:
 *         description: Forbidden - Not a staff
 */
router.post("/scan-qr", (req, res) => {
  // TODO: Implement scan QR controller
  res.status(200).json({ message: "Staff: Scan QR code (TODO)" });
});

/**
 * @swagger
 * /api/staff/verify-ticket:
 *   post:
 *     summary: Verify ticket (Staff only)
 *     description: Staff verifies a ticket. Only staff can access.
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Ticket verified
 *       403:
 *         description: Forbidden - Not a staff
 */
router.post("/verify-ticket", (req, res) => {
  // TODO: Implement verify ticket controller
  res.status(200).json({ message: "Staff: Verify ticket (TODO)" });
});

export default router;
