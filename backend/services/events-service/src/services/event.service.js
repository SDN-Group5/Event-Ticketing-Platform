import Event from '../models/Event.js';

export const createNewEvent = async (eventData, organizerId) => {
    // Thêm logic nghiệp vụ ở đây (nếu có). VD: Validate thời gian startTime < endTime
    if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
    }

    const newEvent = new Event({
        ...eventData,
        organizerId,
        status: 'pending' // Tạo xong mặc định chờ Admin duyệt theo đúng spec
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