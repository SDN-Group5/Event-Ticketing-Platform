export const validateBody = (schema) => {
    return (req, res, next) => {
        // Tham số abortEarly: false giúp Joi trả về TẤT CẢ các lỗi cùng lúc (thay vì gặp lỗi đầu tiên là dừng)
        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            // Format lại mảng lỗi cho đẹp để Frontend dễ map vào UI
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: errorMessage,
                    details: error.details.map(err => ({
                        field: err.path[0],
                        message: err.message
                    }))
                }
            });
        }

        // Ghi đè lại req.body bằng value đã được Joi format (ví dụ tự ép kiểu string thành date)
        req.body = value;
        next();
    };
};