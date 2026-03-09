import * as eventService from '../services/event.service.js';

export const createEvent = async (req, res) => {
    try {
        // req.user có được là nhờ middleware verifyToken đã chạy trước đó
        const organizerId = req.user.id;
        const event = await eventService.createNewEvent(req.body, organizerId);

        // ✨ AUTO-CREATE BLANK LAYOUT
        try {
            const layoutServiceUrl = process.env.LAYOUT_SERVICE_URL || 'http://localhost:4002';
            const token = req.headers.authorization; // Bao gồm cả 'Bearer ...'

            const layoutResponse = await fetch(`${layoutServiceUrl}/api/v1/layouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': token }) // Chuyển tiếp JWT token
                },
                body: JSON.stringify({
                    eventId: event._id,
                    eventName: event.name || 'New Event',
                    canvasWidth: 800,
                    canvasHeight: 600,
                    canvasColor: '#1e1a29',
                    zones: [] // Blank layout
                })
            });

            if (!layoutResponse.ok) {
                const errData = await layoutResponse.json().catch(() => ({}));
                console.error('[EventController] Warning: Failed to auto-create layout:', errData);
            } else {
                console.log(`[EventController] Successfully auto-created blank layout for event ${event._id}`);
            }
        } catch (layoutError) {
            console.error('[EventController] Error calling layout-service:', layoutError.message);
            // Không throw error để block việc tạo event, vì event đã tạo thành công rồi.
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