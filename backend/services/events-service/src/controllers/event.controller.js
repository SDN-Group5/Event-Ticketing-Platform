import * as eventService from '../services/event.service.js';
import { publishEvent } from '../config/rabbitmq.js';

export const createEvent = async (req, res) => {
    try {
        const organizerId = req.user.id;
        const event = await eventService.createNewEvent(req.body, organizerId);

        // Publish event.created qua RabbitMQ -> layout-service se tu dong tao blank layout
        const published = await publishEvent('event.created', {
            eventId: String(event._id),
            eventName: event.name || 'New Event',
            organizerId,
            canvasWidth: 800,
            canvasHeight: 600,
            canvasColor: '#1e1a29',
            zones: [],
        });

        if (!published) {
            console.warn(`[EventController] RabbitMQ chua san sang, event.created khong duoc gui cho event ${event._id}`);
        }

        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const events = await eventService.fetchAllEvents(req.query);
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await eventService.fetchEventById(req.params.id);
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await eventService.modifyEvent(req.params.id, req.body, req.user.id, req.user.role);
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(403).json({ success: false, message: error.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        await eventService.removeEvent(req.params.id, req.user.id, req.user.role);
        res.status(200).json({ success: true, message: 'Đã xóa sự kiện' });
    } catch (error) {
        res.status(403).json({ success: false, message: error.message });
    }
};

export const getMyEvents = async (req, res) => {
    try {
        const organizerId = req.user.id; // Lấy ID từ token
        const events = await eventService.fetchMyEvents(organizerId, req.query);
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// ADMIN: Event Approval System
// ============================================

/**
 * GET /api/events/admin/pending
 * Admin: Get all pending events awaiting approval
 */
export const getPendingEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, organizerId, search } = req.query;
        const skip = (page - 1) * limit;

        const filter = { status: 'draft' };
        
        if (organizerId) {
            filter.organizerId = organizerId;
        }
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const Event = (await import('../models/Event.js')).default;
        
        const events = await Event.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: events.length,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            data: events
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PATCH /api/events/:id/approve
 * Admin: Approve an event (change status from draft to published)
 */
export const approveEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const event = await eventService.publishEvent(id, adminId);

        res.status(200).json({
            success: true,
            message: 'Event published successfully',
            data: event
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * PATCH /api/events/:id/reject
 * Admin: Reject an event (change status to rejected)
 */
export const rejectEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const adminId = req.user.id;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const event = await eventService.rejectEvent(id, adminId, rejectionReason);

        res.status(200).json({
            success: true,
            message: 'Event rejected successfully',
            data: event
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// ============================================
// Venue Management Endpoints
// ============================================

/**
 * GET /api/events/venues/suggested
 * Get suggested venues based on popularity
 */
export const getSuggestedVenues = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const venues = await eventService.getSuggestedVenues(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: venues.length,
            data: venues
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/events/venues/check-availability
 * Check time slot availability for a specific venue
 */
export const checkVenueAvailability = async (req, res) => {
    try {
        const { location, startTime, endTime } = req.body;

        if (!location || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'location, startTime, and endTime are required'
            });
        }

        const availability = await eventService.checkTimeSlotAvailability(
            location,
            new Date(startTime),
            new Date(endTime)
        );

        res.status(200).json({
            success: true,
            data: availability
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};