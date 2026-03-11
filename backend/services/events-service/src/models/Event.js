import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  organizerId: { type: String, required: true }, // Tham chiếu đến bảng User (Auth Service)
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String }, 
  location: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'rejected', 'cancelled'], 
    default: 'draft' 
  },
  banners: [{ type: String }],
  policies: { type: String },
  
  // Admin Approval Fields
  publishedBy: { type: String, default: null }, // Admin ID who published
  publishedAt: { type: Date, default: null },
  rejectedBy: { type: String, default: null }, // Admin ID who rejected
  rejectedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null },
  
}, { 
  timestamps: true 
});

export default mongoose.model('Event', eventSchema);