import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// ============================================
// INTERFACE
// ============================================
export type UserRole = 'customer' | 'organizer' | 'staff' | 'admin';

export interface IUserDocument extends Document {
  companyId?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationCode?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetCode?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ============================================
// SCHEMA
// ============================================
const userSchema = new Schema<IUserDocument>(
  {
    companyId: { type: String, index: true },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password là bắt buộc'],
      minlength: [6, 'Password phải có ít nhất 6 ký tự'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'Họ là bắt buộc'],
      trim: true,
      minlength: [2, 'Họ phải có ít nhất 2 ký tự'],
      maxlength: [30, 'Họ không được vượt quá 30 ký tự'],
      validate: {
        validator: (v: string) => /^[\p{L}\s'-]+$/u.test(v),
        message: 'Họ chỉ được chứa chữ cái, khoảng trắng, dấu gạch ngang và dấu nháy đơn',
      },
    },
    lastName: {
      type: String,
      required: [true, 'Tên là bắt buộc'],
      trim: true,
      minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
      maxlength: [30, 'Tên không được vượt quá 30 ký tự'],
      validate: {
        validator: (v: string) => /^[\p{L}\s'-]+$/u.test(v),
        message: 'Tên chỉ được chứa chữ cái, khoảng trắng, dấu gạch ngang và dấu nháy đơn',
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['customer', 'organizer', 'staff', 'admin'],
      default: 'customer',
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    passwordResetCode: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// MIDDLEWARE: Hash password trước khi save
// ============================================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// METHODS
// ============================================
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ============================================
// EXPORT MODEL
// ============================================
export const User = mongoose.model<IUserDocument>('User', userSchema, 'users');
