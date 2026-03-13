import EventLayout from '../models/EventLayout.js';

// [GET] /api/events/admin/pending
export const getPendingEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { status: 'draft' };
        if (req.query.search) {
            query.eventName = { $regex: req.query.search, $options: 'i' };
        }

        const events = await EventLayout.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const formattedEvents = events.map(event => ({
            _id: event.eventId || event._id, // frontend uses event._id for API calls
            title: event.eventName,
            description: event.eventDescription,
            category: 'general', // Defaulting as category doesn't exist on EventLayout
            location: event.eventLocation,
            organizerId: event.createdBy,
            startTime: event.eventDate,
            endTime: event.eventDate,
            createdAt: event.createdAt,
            status: event.status,
            bannerUrl: event.eventImage,
            payoutInfo: event.payoutInfo,
            invoiceInfo: event.invoiceInfo
        }));

        const total = await EventLayout.countDocuments(query);

        res.status(200).json({
            success: true,
            data: formattedEvents,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting pending events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving pending events'
        });
    }
};

// [GET] /api/events/:eventId/review - Get event details for review
export const getEventForReview = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await EventLayout.findOne({
            $or: [{ eventId }, { _id: eventId }]
        }).populate('createdBy', 'name email');

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error('Error getting event for review:', error);
        res.status(500).json({ success: false, message: 'Server error retrieving event' });
    }
};

// [PATCH] /api/events/:eventId/approve
export const approveEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const adminId = req.user ? req.user.id : null;

        const event = await EventLayout.findOneAndUpdate(
            { $or: [{ eventId }, { _id: eventId }] },
            {
                status: 'published',
                approvedBy: adminId,
                approvedAt: new Date(),
                rejectionReason: null
            },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error('Error approving event:', error);
        res.status(500).json({ success: false, message: 'Server error approving event' });
    }
};

// [PATCH] /api/events/:eventId/reject
export const rejectEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { rejectionReason } = req.body;

        if (!rejectionReason || rejectionReason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const event = await EventLayout.findOneAndUpdate(
            { $or: [{ eventId }, { _id: eventId }] },
            {
                status: 'rejected',
                rejectionReason: rejectionReason.trim(),
                approvedBy: null,
                approvedAt: null
            },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error('Error rejecting event:', error);
        res.status(500).json({ success: false, message: 'Server error rejecting event' });
    }
};

// [PATCH] /api/events/:eventId/payout
export const processEventPayout = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { amount, sendEmail } = req.body;

        let receiptUrl = null;
        if (req.file) {
            // Assuming layout service has static serving for uploads configured
            receiptUrl = `${req.protocol}://${req.get('host')}/uploads/payouts/${req.file.filename}`;
        }

        const event = await EventLayout.findOneAndUpdate(
            { $or: [{ eventId }, { _id: eventId }] },
            {
                payoutStatus: 'paid',
                payoutReceiptUrl: receiptUrl,
                payoutAt: new Date()
            },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Trigger email sending via auth-service if requested
        if (sendEmail === 'true' || sendEmail === true) {
            try {
                // auth-service runs on localhost:4001, but the gateway routes /api/users to it.
                // In microservices, we should use internal network URLs or direct calls if known.
                const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
                const axios = await import('axios');

                await axios.default.post(`${authServiceUrl}/users/send-payout-email`, {
                    organizerId: event.createdBy,
                    eventName: event.eventName,
                    amount: Number(amount),
                    receiptUrl: receiptUrl
                }, {
                    headers: {
                        // Pass auth token if needed, or configure internal auth
                        Authorization: req.headers.authorization
                    }
                });
                console.log('Successfully requested payout email for event:', event.eventName);
            } catch (emailError) {
                console.error('Failed to request payout email. Payout succeeded though.', emailError.message);
                // We don't fail the whole request just because email failed
            }
        }

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error('Error processing event payout:', error);
        res.status(500).json({ success: false, message: 'Server error processing event payout' });
    }
};
