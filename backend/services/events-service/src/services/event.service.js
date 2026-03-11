import Event from '../models/Event.js';

export const createNewEvent = async (eventData, organizerId) => {
    // Validate time
    if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
    }

    const newEvent = new Event({
        ...eventData,
        organizerId,
        status: 'draft' // Tạo xong mặc định là draft, chờ Admin duyệt
    });

    return await newEvent.save();
};

export const fetchAllEvents = async (filters = {}) => {
    // Chỉ lấy các sự kiện đã được duyệt (published) nếu là user bình thường tìm kiếm
    const query = { status: 'published', ...filters };
    return await Event.find(query).sort({ createdAt: -1 });
};

export const fetchEventById = async (eventId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Không tìm thấy sự kiện');
    return event;
};

export const modifyEvent = async (eventId, updateData, userId, userRole) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Không tìm thấy sự kiện');

    // Logic bảo mật: Chỉ Admin hoặc chính Organizer tạo ra event này mới được sửa
    if (userRole !== 'admin' && event.organizerId !== userId) {
        throw new Error('Bạn không có quyền chỉnh sửa sự kiện này');
    }

    Object.assign(event, updateData);
    return await event.save();
};

export const removeEvent = async (eventId, userId, userRole) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Không tìm thấy sự kiện');

    if (userRole !== 'admin' && event.organizerId !== userId) {
        throw new Error('Bạn không có quyền xóa sự kiện này');
    }

    await event.deleteOne();
    return true;
};

export const fetchMyEvents = async (organizerId, filters = {}) => {
    // Tìm tất cả sự kiện có organizerId khớp với ID của user đang đăng nhập
    const query = { organizerId, ...filters };
    return await Event.find(query).sort({ createdAt: -1 });
};

// ============================================
// Admin Event Approval
// ============================================

export const fetchPendingEvents = async (filters = {}) => {
    const query = { status: 'draft', ...filters };
    return await Event.find(query).sort({ createdAt: -1 });
};

export const publishEvent = async (eventId, adminId) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Không tìm thấy sự kiện');
    
    if (event.status !== 'draft') {
        throw new Error(`Không thể công bố sự kiện với trạng thái: ${event.status}`);
    }
    
    event.status = 'published';
    event.publishedBy = adminId;
    event.publishedAt = new Date();
    return await event.save();
};

export const rejectEvent = async (eventId, adminId, rejectionReason) => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error('Không tìm thấy sự kiện');
    
    if (event.status !== 'draft') {
        throw new Error(`Không thể từ chối sự kiện với trạng thái: ${event.status}`);
    }
    
    event.status = 'rejected';
    event.rejectedBy = adminId;
    event.rejectedAt = new Date();
    event.rejectionReason = rejectionReason;
    return await event.save();
};

