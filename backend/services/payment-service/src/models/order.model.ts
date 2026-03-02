import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderCode: number;
  userId: string;
  eventId: string;
  eventName: string;
  organizerId: string;

  organizerBank?: {
    bankAccountName: string;
    bankAccountNumber: string;
    bankName?: string;
    bankCode?: string;
  };

  items: {
    zoneName: string;
    seatId?: string;
    price: number;
    quantity: number;
  }[];

  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
  organizerAmount: number;
  totalAmount: number;

  channel?: 'jsp' | 'mobile' | string;

  payoutStatus?: 'pending' | 'success' | 'failed' | 'skipped';
  payoutTxnId?: string;
  payoutError?: string;
  payoutAt?: Date;

  status: 'pending' | 'processing' | 'paid' | 'cancelled' | 'expired' | 'refunded';
  payosPaymentLinkId?: string;
  payosCheckoutUrl?: string;
  qrCode?: string;

  paidAt?: Date;
  cancelledAt?: Date;
}

const OrderItemSchema = new Schema(
  {
    zoneName: { type: String, required: true },
    seatId: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderCode: { type: Number, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    eventId: { type: String, required: true },
    eventName: { type: String, required: true },
    organizerId: { type: String, required: true, index: true },

    organizerBank: {
      bankAccountName: { type: String },
      bankAccountNumber: { type: String },
      bankName: { type: String },
      bankCode: { type: String },
    },

    items: { type: [OrderItemSchema], required: true },

    subtotal: { type: Number, required: true },
    commissionRate: { type: Number, required: true, default: 0.05 },
    commissionAmount: { type: Number, required: true },
    organizerAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    channel: { type: String, default: 'jsp' },

    payoutStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'skipped'],
      default: 'pending',
    },
    payoutTxnId: { type: String },
    payoutError: { type: String },
    payoutAt: { type: Date },

    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'cancelled', 'expired', 'refunded'],
      default: 'pending',
    },
    payosPaymentLinkId: { type: String },
    payosCheckoutUrl: { type: String },
    qrCode: { type: String },

    paidAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// TTL index: tự xoá các order KHÔNG phải paid sau 5 phút
// Mongo sẽ check theo trường createdAt, chỉ áp dụng cho document có status != 'paid'
OrderSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 300, // 5 phút
    partialFilterExpression: { status: { $ne: 'paid' } },
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
