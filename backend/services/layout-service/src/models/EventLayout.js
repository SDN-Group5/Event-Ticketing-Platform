import mongoose from 'mongoose';

// Hybrid cache metadata for seat zones
const seatMetadataSchema = new mongoose.Schema({
    totalSeats: { type: Number, required: true, default: 0 },
    availableSeats: { type: Number, required: true, default: 0 },
    reservedSeats: { type: Number, default: 0 },
    soldSeats: { type: Number, default: 0 },
    blockedSeats: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const layoutZoneSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Client-side UUID
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    type: {
        type: String,
        required: true,
        enum: ['seats', 'standing', 'stage', 'exit', 'barrier']
    },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    size: {
        width: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    color: {
        type: String,
        required: true,
        match: /^#[0-9A-Fa-f]{6}$/  // Hex color validation
    },
    rotation: {
        type: Number,
        default: 0,
        min: 0,
        max: 360
    },
    // Seat zone specific
    rows: {
        type: Number,
        min: 1,
        max: 50
    },
    seatsPerRow: {
        type: Number,
        min: 1,
        max: 50
    },
    price: {
        type: Number,
        min: 0
    },

    // ✨ HYBRID: Cache metadata for performance
    seatMetadata: seatMetadataSchema,

    // 3D rendering
    elevation: {
        type: Number,
        default: 0,
        min: 0,
        max: 20
    },
    // Stage specific
    hideScreen: {
        type: Boolean,
        default: false
    },
    videoUrl: {
        type: String
    },
    screenHeight: {
        type: Number,
        min: 2,
        max: 15
    },
    screenWidthRatio: {
        type: Number,
        min: 0.3,
        max: 1.0
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, { _id: false }); // Zones are part of the layout, not standalone documents with _id

const eventLayoutSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        unique: true,
        index: true
    },
    eventName: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    eventImage: {
        type: String,
        default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30' // Default placeholder image
    },
    eventLocation: {
        type: String,
        default: 'TBD'
    },
    eventDescription: {
        type: String,
        default: 'No description available.'
    },
    minPrice: {
        type: Number,
        default: 0
    },
    zones: [layoutZoneSchema],
    canvasWidth: {
        type: Number,
        required: true,
        default: 800,
        min: 400,
        max: 2000
    },
    canvasHeight: {
        type: Number,
        required: true,
        default: 600,
        min: 300,
        max: 1500
    },
    canvasColor: {
        type: String,
        required: true,
        default: '#0f1219',
        match: /^#[0-9A-Fa-f]{6}$/
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    version: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'rejected', 'completed'],
        default: 'draft'
    },
    rejectionReason: {
        type: String,
        maxlength: 500
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    // Payout / bank info for organizer
    payoutInfo: {
        accountName: { type: String, maxlength: 100 },
        accountNumber: { type: String, maxlength: 50 },
        bankName: { type: String, maxlength: 100 },
        branchName: { type: String, maxlength: 100 }
    },
    // Liquidity Payout Status
    payoutStatus: {
        type: String,
        enum: ['unpaid', 'processing', 'paid'],
        default: 'unpaid'
    },
    payoutReceiptUrl: {
        type: String
    },
    payoutAt: {
        type: Date
    },
    // Invoice / billing info
    invoiceInfo: {
        businessType: { type: String, enum: ['individual', 'company'], default: 'individual' },
        fullName: { type: String, maxlength: 100 },
        address: { type: String, maxlength: 200 },
        taxCode: { type: String, maxlength: 50 }
    }
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt
});



// Validation: Seat zones must have rows and seatsPerRow
eventLayoutSchema.pre('save', async function () {
    for (const zone of this.zones) {
        if (zone.type === 'seats') {
            if (!zone.rows || !zone.seatsPerRow) {
                throw new Error('Seat zones must have rows and seatsPerRow');
            }
        }
    }
});

// Increment version on update
eventLayoutSchema.pre('findOneAndUpdate', function () {
    // In Mongoose query middleware, `this` là Query instance
    // dùng this.set() để merge update hiện tại với $inc version
    this.set({ $inc: { version: 1 } });
});

const EventLayout = mongoose.model('EventLayout', eventLayoutSchema);

export default EventLayout;
