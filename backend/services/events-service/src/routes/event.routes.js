import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// [PUBLIC] Ai cũng có thể xem danh sách và chi tiết sự kiện
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// [PROTECTED] Chỉ Organizer và Admin mới được thao tác thêm, sửa, xóa
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

// File index.js của bạn đang dùng eventRoutes(app), nên mình export hàm này:
export default function eventRoutes(app) {
    app.use('/api/events', router);
    // When Railway path-based routing strips /api/events, requests arrive at /
    app.use('/', router);
}