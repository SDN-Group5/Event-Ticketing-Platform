import express from "express";
import verifyToken from "../middleware/auth";
import { roleCheck } from "../middleware/roleCheck";
import * as userController from "../controllers/user.controller";

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user information
 *     description: Returns the currently authenticated user's information. Any authenticated user can access.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", verifyToken, userController.getCurrentUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Returns list of all users. Only admin can access.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get("/", verifyToken, roleCheck(["admin"]), (req, res) => {
  // TODO: Implement get all users controller
  res.status(200).json({ message: "Admin: Get all users (TODO)" });
});

/**
 * @swagger
 * /api/users/:userId:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     description: Returns user information by ID. Only admin can access.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get("/:userId", verifyToken, roleCheck(["admin"]), (req, res) => {
  // TODO: Implement get user by ID controller
  res.status(200).json({ message: "Admin: Get user by ID (TODO)" });
});

/**
 * @swagger
 * /api/users/:userId:
 *   patch:
 *     summary: Update user (Admin only)
 *     description: Updates user information. Only admin can access.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden - Not an admin
 */
router.patch("/:userId", verifyToken, roleCheck(["admin"]), (req, res) => {
  // TODO: Implement update user controller
  res.status(200).json({ message: "Admin: Update user (TODO)" });
});

/**
 * @swagger
 * /api/users/:userId:
 *   delete:
 *     summary: Delete user (Admin only)
 *     description: Deletes a user. Only admin can access.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden - Not an admin
 */
router.delete("/:userId", verifyToken, roleCheck(["admin"]), (req, res) => {
  // TODO: Implement delete user controller
  res.status(200).json({ message: "Admin: Delete user (TODO)" });
});

export default router;
