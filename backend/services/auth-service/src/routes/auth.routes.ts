import express from "express";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth.middleware";
import * as authController from "../controllers/auth.controller";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or validation error
 */
router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.login
);

router.post(
  "/register",
  [
    check("firstName", "First name is required")
      .isString()
      .trim()
      .isLength({ min: 2, max: 30 }).withMessage("First name phải từ 2-30 ký tự")
      .matches(/^[\p{L}\s'-]+$/u).withMessage("First name chỉ được chứa chữ cái, khoảng trắng, dấu gạch ngang"),
    check("lastName", "Last name is required")
      .isString()
      .trim()
      .isLength({ min: 2, max: 30 }).withMessage("Last name phải từ 2-30 ký tự")
      .matches(/^[\p{L}\s'-]+$/u).withMessage("Last name chỉ được chứa chữ cái, khoảng trắng, dấu gạch ngang"),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.register
);

router.post(
  "/verify-email",
  [check("email", "Email is required").isEmail(), check("code", "Code is required").isString().isLength({ min: 6, max: 6 })],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.verifyEmail
);

router.post(
  "/resend-verification",
  [check("email", "Email is required").isEmail()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.resendVerification
);

router.post("/logout", authController.logout);

router.get("/validate-token", verifyToken, authController.validateToken);

router.post(
  "/forgot-password",
  [check("email", "Email is required").isEmail()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.forgotPassword
);

router.post(
  "/verify-reset-code",
  [
    check("email", "Email is required").isEmail(),
    check("code", "Code is required").isString().isLength({ min: 6, max: 6 }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.verifyResetCode
);

router.post(
  "/reset-password",
  [
    check("email", "Email is required").isEmail(),
    check("code", "Code is required").isString().isLength({ min: 6, max: 6 }),
    check("newPassword", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.resetPassword
);

// POST /api/auth/google — Google OAuth login/register
router.post(
  "/google",
  [check("credential", "Google credential is required").isString().notEmpty()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.googleLogin
);

// POST /api/auth/change-password
router.post(
  "/change-password",
  verifyToken,
  [
    check("currentPassword", "Current password is required").notEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength({ min: 6 }),
  ],
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }
    next();
  },
  authController.changePassword
);

export default router;
