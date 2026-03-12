import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string; // Unique ticket identifier (TV-{orderCode}-{itemIndex})
  orderId: string; // Reference to Order
  orderCode: number; // Order code for easy tracking
  userId: string; // Customer who owns the ticket
  eventId: string;
  eventName: string;
  zoneName: string;
  seatId?: string; // Reference to Seat (nullable for standing)
  seatLabel?: string; // Display label (A1, B2, etc.)
  
  price: number;
  
  // QR Code
  qrCodePayload: string; // Data encoded in QR (ticket info)
  qrCodeImage?: string; // Cloudinary URL or base64
  
  // Status
  status: 'issued' | 'checked-in' | 'used' | 'cancelled' | 'refunded';
  checkedInAt?: Date;
  usedAt?: Date;
  cancelledAt?: Date;
  
  // Metadata
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
      index: true
    },
    checkedInAt: { type: Date },
    usedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Index for queries
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ eventId: 1, status: 1 });
TicketSchema.index({ orderId: 1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
