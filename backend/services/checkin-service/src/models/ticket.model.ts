import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  orderId: string;
  orderCode: number;
  userId: string;
  eventId: string;
  eventName: string;
  zoneName: string;
  seatId?: string;
  seatLabel?: string;

  price: number;

  qrCodePayload: string;
  qrCodeImage?: string;

  status: 'issued' | 'checked-in' | 'used' | 'cancelled' | 'refunded';
  checkedInAt?: Date;
  usedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderCode: { type: Number, required: true, index: true },
    userId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    eventName: { type: String, required: true },
    zoneName: { type: String, required: true },
    seatId: { type: String },
    seatLabel: { type: String },
    price: { type: Number, required: true },

    qrCodePayload: { type: String, required: true },
    qrCodeImage: { type: String },

    status: {
      type: String,
      enum: ['issued', 'checked-in', 'used', 'cancelled', 'refunded'],
      default: 'issued',
      index: true,
    },
    checkedInAt: { type: Date },
    usedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ eventId: 1, status: 1 });
// orderId đã có index: true trong field, không khai báo thêm schema.index để tránh duplicate

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);

