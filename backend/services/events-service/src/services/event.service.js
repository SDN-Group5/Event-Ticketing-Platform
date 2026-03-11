import Event from '../models/Event.js';

export const createNewEvent = async (eventData, organizerId) => {
    // Validate time
    if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
    }

    // Validate date is not in the past
    const startTime = new Date(eventData.startTime);
    const now = new Date();
    if (startTime <= now) {
        throw new Error('Thời gian bắt đầu phải ở tương lai (tối thiểu 1 phút)');
    }

    // Check for time slot conflicts at the same location
    const hasConflict = await Event.hasTimeConflict(
        eventData.location,
        new Date(eventData.startTime),
        new Date(eventData.endTime)
    );

    if (hasConflict) {
        throw new Error('Địa điểm này đã có sự kiện khác trong khoảng thời gian này. Vui lòng chọn thời gian khác.');
    }

    // Normalize banners format: convert string array to object array
    let banners = eventData.banners || [];
    if (banners.length > 0 && typeof banners[0] === 'string') {
        banners = banners.map(url => ({ url, title: '' }));
    }

    const newEvent = new Event({
        ...eventData,
        banners,
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

    // Validate time if updating
    if (updateData.startTime && updateData.endTime) {
        if (new Date(updateData.startTime) >= new Date(updateData.endTime)) {
            throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
        }

        // Validate date is not in the past
        const startTime = new Date(updateData.startTime);
        const now = new Date();
        if (startTime <= now) {
            throw new Error('Thời gian bắt đầu phải ở tương lai (tối thiểu 1 phút)');
        }

        // Check for time slot conflicts if location or time changed
        const location = updateData.location || event.location;
        const hasConflict = await Event.hasTimeConflict(
            location,
            new Date(updateData.startTime),
            new Date(updateData.endTime),
            eventId // exclude current event
        );

        if (hasConflict) {
            throw new Error('Địa điểm này đã có sự kiện khác trong khoảng thời gian này. Vui lòng chọn thời gian khác.');
        }
    }

    // Normalize banners format
    if (updateData.banners) {
        let banners = updateData.banners;
        if (banners.length > 0 && typeof banners[0] === 'string') {
            banners = banners.map(url => ({ url, title: '' }));
        }
        updateData.banners = banners;
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

// ============================================
// Venue Management & Suggestions
// ============================================

/**
 * Get suggested venues based on popularity
 * @param {number} limit - Number of venues to suggest
 * @returns {Promise<string[]>} List of venue names
 */
export const getSuggestedVenues = async (limit = 5) => {
    try {
        const venues = await Event.getSuggestedVenues(limit);
        return venues && venues.length > 0 ? venues : getDefaultVenues();
    } catch (error) {
        console.error('Error getting suggested venues:', error);
        return getDefaultVenues();
    }
};

/**
 * Get default venues for suggestions
 * @returns {string[]} List of default venue names
 */
export const getDefaultVenues = () => {
    return [
        'Nhà thi đấu Phú Thọ - TP.HCM',
        'Sân vận động Mỹ Đình - Hà Nội',
        'Nhà thi đấu Thanh Trì - Hà Nội',
        'Sân vận động Thống Nhất - TP.HCM',
        'Trung tâm Hội chợ Triển lãm Sài Gòn (SECC)',
        'Cung thiết tế Liên Triều - TP.HCM',
        'Nhà thi đấu Phan Đình Phùng - Hà Nội',
        'Sân vận động Công Viên Cây Xanh - TP.HCM'
    ];
};

/**
 * Check time slot availability for a venue
 * @param {string} location - Venue name
 * @param {Date} startTime - Event start time
 * @param {Date} endTime - Event end time
 * @returns {Promise<{available: boolean, conflictingEvents: Array}>}
 */
export const checkTimeSlotAvailability = async (location, startTime, endTime) => {
    const hasConflict = await Event.hasTimeConflict(location, startTime, endTime);
    
    if (hasConflict) {
        // Get conflicting events
        const conflicts = await Event.find({
            location,
            status: { $ne: 'cancelled' },
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        }).select('title startTime endTime');

        return {
            available: false,
            conflictingEvents: conflicts
        };
    }

    return {
        available: true,
        conflictingEvents: []
    };
};

