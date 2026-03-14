import mongoose, { Schema, Document } from 'mongoose';

export interface ICheckinLog extends Document {
  ticketCode: string;
  eventId?: string;
  staffId: string;
  result: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'CANCELLED' | 'REFUNDED' | 'ERROR';
  reason?: string;
  createdAt: Date;
}

const CheckinLogSchema = new Schema<ICheckinLog>(
  {
    ticketCode: { type: String, required: true, index: true },
    eventId: { type: String },
    staffId: { type: String, required: true, index: true },
    result: {
      type: String,
      enum: ['SUCCESS', 'ALREADY_CHECKED_IN', 'INVALID', 'CANCELLED', 'REFUNDED', 'ERROR'],
      required: true,
    },
    reason: { type: String },
  },
  { timestamps: true }
);

CheckinLogSchema.index({ ticketCode: 1, createdAt: -1 });
CheckinLogSchema.index({ staffId: 1, createdAt: -1 });

export const CheckinLog = mongoose.model<ICheckinLog>('CheckinLog', CheckinLogSchema);

