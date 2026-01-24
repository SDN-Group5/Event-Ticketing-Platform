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
 * /api/users/me/avatar:
 *   patch:
 *     summary: Upload user avatar
 *     description: Upload avatar image to Cloudinary and update user profile. Any authenticated user can access.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: No image file provided
 */
// ✅ QUAN TRỌNG: Route /me/avatar phải đặt TRƯỚC route /me để tránh conflict
router.patch(
  "/me/avatar",
  verifyToken,
  (req, res, next) => {
    userController.uploadAvatarMiddleware(req, res, (err) => {
      if (err) {
        return userController.handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  userController.uploadAvatar
);

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update current user profile
 *     description: User can update their own profile information. Any authenticated user can access.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", verifyToken, userController.updateCurrentUser);

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
