import express from "express";
import verifyToken from "../middleware/auth.middleware";
import { roleCheck } from "../middleware/roleCheck.middleware";
import * as userController from "../controllers/user.controller";
import { User } from "../models/user.model";

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user information
 *     description: Returns the currently authenticated user's information
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
 * /api/users/me:
 *   patch:
 *     summary: Update current user profile
 *     description: User can update their own profile information
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", verifyToken, userController.updateCurrentUser);

/**
 * @swagger
 * /api/users/staff:
 *   post:
 *     summary: Create a new staff (Organizer only)
 *     description: Organizer can create a new staff member for their organization
 *     tags: [Staff Management]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Staff created successfully
 *       400:
 *         description: Bad request or email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an organizer
 */
router.post(
  "/staff",
  verifyToken,
  roleCheck(["organizer"]),
  userController.createStaff
);

/**
 * @swagger
 * /api/users/staff:
 *   get:
 *     summary: Get all staff (Organizer only)
 *     description: Organizer can retrieve all their staff members with pagination
 *     tags: [Staff Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: List of staff retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an organizer
 */
router.get(
  "/staff",
  verifyToken,
  roleCheck(["organizer"]),
  userController.getStaffList
);

/**
 * @swagger
 * /api/users/staff/{staffId}:
 *   get:
 *     summary: Get staff by ID (Organizer only)
 *     description: Organizer can retrieve details of a specific staff member
 *     tags: [Staff Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff information retrieved successfully
 *       403:
 *         description: Forbidden - Not authorized to access this staff
 *       404:
 *         description: Staff not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/staff/:staffId",
  verifyToken,
  roleCheck(["organizer"]),
  userController.getStaffById
);

/**
 * @swagger
 * /api/users/staff/{staffId}:
 *   patch:
 *     summary: Update staff information (Organizer only)
 *     description: Organizer can update a staff member's information
 *     tags: [Staff Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden - Not authorized to update this staff
 *       404:
 *         description: Staff not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/staff/:staffId",
  verifyToken,
  roleCheck(["organizer"]),
  userController.updateStaff
);

/**
 * @swagger
 * /api/users/staff/{staffId}:
 *   delete:
 *     summary: Delete staff (Organizer only)
 *     description: Organizer can delete a staff member from their organization
 *     tags: [Staff Management]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 *       403:
 *         description: Forbidden - Not authorized to delete this staff
 *       404:
 *         description: Staff not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/staff/:staffId",
  verifyToken,
  roleCheck(["organizer"]),
  userController.deleteStaff
);

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
router.get("/", verifyToken, roleCheck(["admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    const filter: any = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select("-password -emailVerificationCode -passwordResetCode")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
});

/**
 * @swagger
 * /api/users/send-payout-email:
 *   post:
 *     summary: Send payout notification email
 *     description: Send email to organizer when layout service records a payout
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 */
router.post("/send-payout-email", verifyToken, roleCheck(["admin"]), userController.sendPayoutEmail);

/**
 * @swagger
 * /api/users/{userId}:
 *   patch:
 *     summary: Update any user (Admin only)
 *     description: Admin can update any user's information or status.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
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
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: User not found
 */
router.patch("/:userId", verifyToken, roleCheck(["admin"]), async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, role, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user by ID (Public endpoint for service communication)
 *     description: Fetch basic user information by ID without authentication (email, name, phone, etc.)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/:userId", userController.getUserById);

export default router;
