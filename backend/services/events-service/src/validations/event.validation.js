import Joi from 'joi';

// Schema cho API [POST] Tạo sự kiện
export const createEventSchema = Joi.object({
    title: Joi.string().min(5).max(150).required().messages({
        'string.empty': 'Tên sự kiện không được để trống',
        'string.min': 'Tên sự kiện phải có ít nhất 5 ký tự',
        'any.required': 'Tên sự kiện là bắt buộc'
    }),
    description: Joi.string().allow('', null),
    category: Joi.string().required().messages({
        'any.required': 'Thể loại sự kiện là bắt buộc'
    }),
    location: Joi.string().min(3).required().messages({
        'string.min': 'Địa điểm phải có ít nhất 3 ký tự',
        'any.required': 'Địa điểm là bắt buộc'
    }),
    startTime: Joi.date().iso().greater('now').required().messages({
        'date.greater': 'Thời gian bắt đầu phải ở tương lai (tối thiểu 1 phút)',
        'any.required': 'Thời gian bắt đầu là bắt buộc',
        'date.format': 'Định dạng thời gian không hợp lệ (nên dùng chuẩn ISO)'
    }),
    endTime: Joi.date().iso().required().messages({
        'any.required': 'Thời gian kết thúc là bắt buộc',
        'date.format': 'Định dạng thời gian không hợp lệ (nên dùng chuẩn ISO)'
    }),
    banners: Joi.alternatives(
        Joi.array().items(
            Joi.object({
                url: Joi.string().uri().required().messages({
                    'string.uri': 'URL banner phải hợp lệ'
                }),
                title: Joi.string().optional()
            })
        ),
        Joi.array().items(Joi.string().uri())
    ).optional(),
    policies: Joi.string().allow('', null),
    suggestedVenues: Joi.boolean().optional()
});

// Schema cho API [PUT] Cập nhật sự kiện (Tất cả các trường đều optional)
export const updateEventSchema = Joi.object({
    title: Joi.string().min(5).max(150),
    description: Joi.string().allow('', null),
    category: Joi.string(),
    location: Joi.string().min(3),
    startTime: Joi.date().iso().greater('now').messages({
        'date.greater': 'Thời gian bắt đầu phải ở tương lai'
    }),
    endTime: Joi.date().iso(),
    status: Joi.string().valid('draft', 'published', 'rejected', 'cancelled'),
    banners: Joi.alternatives(
        Joi.array().items(
            Joi.object({
                url: Joi.string().uri().required(),
                title: Joi.string().optional()
            })
        ),
        Joi.array().items(Joi.string().uri())
    ),
    policies: Joi.string().allow('', null)
}).min(1); // Yêu cầu phải truyền lên ít nhất 1 trường để cập nhật

// Schema kiểm tra xung đột khung giờ
export const checkTimeSlotSchema = Joi.object({
    location: Joi.string().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
});