import mongoose, { Schema, Document } from 'mongoose';

export interface IStaffRequest extends Document {
  staffId: string;
  staffName?: string;
  eventId: string;
  eventName?: string;
  organizerId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const StaffRequestSchema = new Schema<IStaffRequest>(
  {
    staffId: { type: String, required: true, index: true },
    staffName: { type: String },
    eventId: { type: String, required: true, index: true },
    eventName: { type: String },
    organizerId: { type: String, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const StaffRequest = mongoose.model<IStaffRequest>('StaffRequest', StaffRequestSchema);
