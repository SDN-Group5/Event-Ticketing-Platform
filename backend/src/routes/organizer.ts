import express from "express";
import verifyToken from "../middleware/auth";
import { roleCheck } from "../middleware/roleCheck";

const router = express.Router();

/**
 * Organizer Routes
 * Tất cả routes trong này yêu cầu:
 * - verifyToken: User phải đăng nhập
 * - roleCheck(["organizer"]): Chỉ organizer mới được truy cập
 */

// Áp dụng middleware cho tất cả routes trong router này
router.use(verifyToken);
router.use(roleCheck(["organizer"]));

/**
 * @swagger
 * /api/organizer/events:
 *   get:
 *     summary: Get organizer's events
 *     description: Returns list of events created by the organizer. Only organizer can access.
 *     tags: [Organizer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *       403:
 *         description: Forbidden - Not an organizer
 */
router.get("/events", (req, res) => {
  // TODO: Implement get organizer events controller
  res.status(200).json({ message: "Organizer: Get my events (TODO)" });
});

/**
 * @swagger
 * /api/organizer/events:
 *   post:
 *     summary: Create new event (Organizer only)
 *     description: Organizer creates a new event. Only organizer can access.
 *     tags: [Organizer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Event created
 *       403:
 *         description: Forbidden - Not an organizer
 */
router.post("/events", (req, res) => {
  // TODO: Implement create event controller
  res.status(201).json({ message: "Organizer: Create event (TODO)" });
});

/**
 * @swagger
 * /api/organizer/vouchers:
 *   get:
 *     summary: Get organizer's vouchers
 *     description: Returns list of vouchers. Only organizer can access.
 *     tags: [Organizer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of vouchers
 *       403:
 *         description: Forbidden - Not an organizer
 */
router.get("/vouchers", (req, res) => {
  // TODO: Implement get vouchers controller
  res.status(200).json({ message: "Organizer: Get vouchers (TODO)" });
});

/**
 * @swagger
 * /api/organizer/staff:
 *   get:
 *     summary: Get organizer's staff
 *     description: Returns list of staff members. Only organizer can access.
 *     tags: [Organizer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of staff
 *       403:
 *         description: Forbidden - Not an organizer
 */
router.get("/staff", (req, res) => {
  // TODO: Implement get staff controller
  res.status(200).json({ message: "Organizer: Get staff (TODO)" });
});

/**
 * @swagger
 * /api/organizer/analytics:
 *   get:
 *     summary: Get organizer analytics
 *     description: Returns analytics data. Only organizer can access.
 *     tags: [Organizer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *       403:
 *         description: Forbidden - Not an organizer
 */
router.get("/analytics", (req, res) => {
  // TODO: Implement analytics controller
  res.status(200).json({ message: "Organizer: Get analytics (TODO)" });
});

export default router;
