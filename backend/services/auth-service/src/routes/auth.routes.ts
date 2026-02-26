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
    check("firstName", "First name is required").isString().isLength({ min: 2 }),
    check("lastName", "Last name is required").isString().isLength({ min: 2 }),
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

export default router;
