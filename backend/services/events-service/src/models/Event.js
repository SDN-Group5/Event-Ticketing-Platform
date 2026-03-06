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
    enum: ['draft', 'pending', 'approved', 'published', 'cancelled'], 
    default: 'draft' 
  },
  banners: [{ type: String }],
  policies: { type: String }
}, { 
  timestamps: true 
});

export default mongoose.model('Event', eventSchema);