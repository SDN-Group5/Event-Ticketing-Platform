import express from "express";
import verifyToken from "../middleware/auth";
import { roleCheck } from "../middleware/roleCheck";

const router = express.Router();

/**
 * Customer Routes
 * Tất cả routes trong này yêu cầu:
 * - verifyToken: User phải đăng nhập
 * - roleCheck(["customer"]): Chỉ customer mới được truy cập
 */

// Áp dụng middleware cho tất cả routes trong router này
router.use(verifyToken);
router.use(roleCheck(["customer"]));

/**
 * @swagger
 * /api/customer/orders:
 *   get:
 *     summary: Get customer's orders
 *     description: Returns list of orders for the current customer. Only customer can access.
 *     tags: [Customer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       403:
 *         description: Forbidden - Not a customer
 */
router.get("/orders", (req, res) => {
  // TODO: Implement get customer orders controller
  res.status(200).json({ message: "Customer: Get my orders (TODO)" });
});

/**
 * @swagger
 * /api/customer/tickets:
 *   get:
 *     summary: Get customer's tickets
 *     description: Returns list of tickets for the current customer. Only customer can access.
 *     tags: [Customer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *       403:
 *         description: Forbidden - Not a customer
 */
router.get("/tickets", (req, res) => {
  // TODO: Implement get customer tickets controller
  res.status(200).json({ message: "Customer: Get my tickets (TODO)" });
});

/**
 * @swagger
 * /api/customer/wallet:
 *   get:
 *     summary: Get customer's wallet
 *     description: Returns wallet information for the current customer. Only customer can access.
 *     tags: [Customer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Wallet information
 *       403:
 *         description: Forbidden - Not a customer
 */
router.get("/wallet", (req, res) => {
  // TODO: Implement get wallet controller
  res.status(200).json({ message: "Customer: Get my wallet (TODO)" });
});

/**
 * @swagger
 * /api/customer/favorites:
 *   get:
 *     summary: Get customer's favorites
 *     description: Returns list of favorite events. Only customer can access.
 *     tags: [Customer]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 *       403:
 *         description: Forbidden - Not a customer
 */
router.get("/favorites", (req, res) => {
  // TODO: Implement get favorites controller
  res.status(200).json({ message: "Customer: Get my favorites (TODO)" });
});

export default router;
