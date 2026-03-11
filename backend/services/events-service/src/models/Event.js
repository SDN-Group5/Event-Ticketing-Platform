import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  organizerId: { type: String, required: true }, // Tham chiếu đến bảng User (Auth Service)
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String }, 
  location: { type: String, required: true },
  startTime: { 
    type: Date, 
    required: true,
    // Validate thời gian bắt đầu không được ở quá khứ
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại'
    }
  },
  endTime: { 
    type: Date,
    // Validate thời gian kết thúc phải sau thời gian bắt đầu
    validate: {
      validator: function(value) {
        if (!value) return true; // Optional field
        return value > this.startTime;
      },
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
    }
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'rejected', 'cancelled'], 
    default: 'draft' 
  },
  // Enhanced banner field
  banners: [{
    url: { type: String, required: true },
    title: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
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

// Index for faster venue-based queries
eventSchema.index({ location: 1, startTime: 1, endTime: 1 });

// Static method to check time slot conflicts
eventSchema.statics.hasTimeConflict = async function(location, startTime, endTime, excludeEventId = null) {
  const query = {
    location,
    status: { $ne: 'cancelled' },
    $or: [
      // Sự kiện mới bắt đầu trước khi sự kiện cũ kết thúc
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };

  // Loại trừ event đang cập nhật
  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }

  const conflict = await this.findOne(query);
  return !!conflict;
};

// Static method to get suggested venues
eventSchema.statics.getSuggestedVenues = async function(limit = 5) {
  const venues = await this.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$location', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
  return venues.map(v => v._id);
};

export default mongoose.model('Event', eventSchema);