import * as eventService from '../services/event.service.js';

export const createEvent = async (req, res) => {
    try {
        // req.user có được là nhờ middleware verifyToken đã chạy trước đó
        const organizerId = req.user.id; 
        const event = await eventService.createNewEvent(req.body, organizerId);
        
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