import mongoose, { Schema, Document } from 'mongoose';

export type VoucherDiscountType = 'percentage' | 'fixed';

export interface IVoucher extends Document {
  code: string;
  description?: string;

  discountType: VoucherDiscountType;
  discountValue: number;

  maxUses: number;
  usedCount: number;

  startDate?: Date;
  endDate?: Date;

  minimumPrice?: number;

  status: 'active' | 'inactive' | 'expired';

  organizerId?: string;
  eventIds?: string[];
  userId?: string;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    code: { type: String, required: true, unique: true, index: true },
    description: { type: String },

    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: { type: Number, required: true },

    maxUses: { type: Number, required: true, default: 1 },
    usedCount: { type: Number, required: true, default: 0 },

    startDate: { type: Date },
    endDate: { type: Date },

    minimumPrice: { type: Number },

    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },

    organizerId: { type: String },
    eventIds: { type: [String], default: [] },
    userId: { type: String },
  },
  {
    timestamps: true,
  }
);

VoucherSchema.index({ organizerId: 1, status: 1 });
VoucherSchema.index({ userId: 1, status: 1 });

export const Voucher = mongoose.model<IVoucher>('Voucher', VoucherSchema);

