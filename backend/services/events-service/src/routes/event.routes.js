import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// [PUBLIC] Ai cũng có thể xem danh sách và chi tiết sự kiện
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// [PROTECTED] Organizer: My events & create event
router.get(
    '/my-events', 
    verifyToken, 
    authorizeRoles('organizer'), 
    eventController.getMyEvents
);

router.post(
    '/', 
    verifyToken, 
    authorizeRoles('organizer', 'admin'), 
    eventController.createEvent
);

router.put(
    '/:id', 
    verifyToken, 
    authorizeRoles('organizer', 'admin'), 
    eventController.updateEvent
);

router.delete(
    '/:id', 
    verifyToken, 
    authorizeRoles('organizer', 'admin'), 
    eventController.deleteEvent
);

// [ADMIN ONLY] Event Approval System
router.get(
    '/admin/pending',
    verifyToken,
    authorizeRoles('admin'),
    eventController.getPendingEvents
);

router.patch(
    '/:id/approve',
    verifyToken,
    authorizeRoles('admin'),
    eventController.approveEvent
);

router.patch(
    '/:id/reject',
    verifyToken,
    authorizeRoles('admin'),
    eventController.rejectEvent
);

// File index.js của bạn đang dùng eventRoutes(app), nên mình export hàm này:
export default function eventRoutes(app) {
    app.use('/api/events', router);
}