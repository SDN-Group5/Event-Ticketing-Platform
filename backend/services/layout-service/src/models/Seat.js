import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
    // References
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
        // Indexed via compound indexes below
    },
    layoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventLayout',
        required: true
    },
    zoneId: {
        type: String,
        required: true
        // Indexed via compound indexes below
    },

    // Position
    row: {
        type: Number,
        required: true,
        min: 1
    },
    seatNumber: {
        type: Number,
        required: true,
        min: 1
    },
    seatLabel: {
        type: String,
        required: true
    },

    // Status
    status: {
        type: String,
        enum: ['available', 'reserved', 'sold', 'blocked'],
        default: 'available',
        required: true
        // Indexed via compound indexes below
    },

    // Reservation info
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reservedAt: Date,
    reservationExpiry: {
        type: Date
        // TTL index is defined below as compound index
    },

    // Purchase info
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    soldAt: Date,
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },

    // Pricing
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },

    // Metadata
    isAccessible: {
        type: Boolean,
        default: false
    },
    notes: String,

    // Optimistic locking
    version: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound Indexes for efficient queries
seatSchema.index({ eventId: 1, zoneId: 1, status: 1 });
seatSchema.index({ eventId: 1, zoneId: 1, row: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ eventId: 1, status: 1 });
seatSchema.index({ reservationExpiry: 1 }, {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: 'reserved' }
});

// Methods
seatSchema.methods.isAvailable = function () {
    return this.status === 'available';
};

seatSchema.methods.isExpired = function () {
    if (this.status !== 'reserved') return false;
    return this.reservationExpiry && new Date() > this.reservationExpiry;
};

const Seat = mongoose.model('Seat', seatSchema);

export default Seat;
