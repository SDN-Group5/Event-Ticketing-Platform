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
    location: Joi.string().required().messages({
        'any.required': 'Địa điểm là bắt buộc'
    }),
    startTime: Joi.date().iso().greater('now').required().messages({
        'date.greater': 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại',
        'any.required': 'Thời gian bắt đầu là bắt buộc',
        'date.format': 'Định dạng thời gian không hợp lệ (nên dùng chuẩn ISO)'
    }),
    // endTime không bắt buộc, nhưng nếu có thì phải lớn hơn startTime
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).optional().messages({
        'date.greater': 'Thời gian kết thúc phải sau thời gian bắt đầu'
    }),
    banners: Joi.array().items(Joi.string().uri()).optional().messages({
        'string.uri': 'Link banner phải là một URL hợp lệ'
    }),
    policies: Joi.string().allow('', null)
});

// Schema cho API [PUT] Cập nhật sự kiện (Tất cả các trường đều optional)
export const updateEventSchema = Joi.object({
    title: Joi.string().min(5).max(150),
    description: Joi.string().allow('', null),
    category: Joi.string(),
    location: Joi.string(),
    startTime: Joi.date().iso().greater('now'),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')),
    status: Joi.string().valid('draft', 'published', 'rejected', 'cancelled'),
    banners: Joi.array().items(Joi.string().uri()),
    policies: Joi.string().allow('', null)
}).min(1); // Yêu cầu phải truyền lên ít nhất 1 trường để cập nhật