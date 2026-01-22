import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

/**
 * EmptyState Component
 * 
 * MỤC ĐÍCH:
 * - Hiển thị UI khi không có data (empty list, no results, etc.)
 * - Cung cấp action buttons để user có thể thực hiện hành động
 * - Tạo trải nghiệm tốt hơn thay vì để màn hình trống
 * 
 * CÁCH SỬ DỤNG:
 * 
 * // Ví dụ 1: Empty list
 * {bookings.length === 0 && (
 *   <EmptyState
 *     icon={Calendar}
 *     title="Chưa có đặt phòng nào"
 *     description="Bạn chưa có đặt phòng nào. Hãy bắt đầu đặt phòng ngay!"
 *     actionLabel="Đặt phòng ngay"
 *     onAction={() => navigate("/search")}
 *   />
 * )}
 * 
 * // Ví dụ 2: No search results
 * {hotels.length === 0 && !isLoading && (
 *   <EmptyState
 *     icon={Search}
 *     title="Không tìm thấy khách sạn"
 *     description="Không có khách sạn nào phù hợp với tiêu chí tìm kiếm của bạn."
 *     actionLabel="Thử lại"
 *     onAction={() => navigate("/search")}
 *   />
 * )}
 */

interface EmptyStateProps {
    /**
     * Icon hiển thị (từ lucide-react)
     * Ví dụ: Calendar, Search, Package, etc.
     */
    icon: LucideIcon;

    /**
     * Tiêu đề chính
     */
    title: string;

    /**
     * Mô tả chi tiết (optional)
     */
    description?: string;

    /**
     * Label cho action button (optional)
     * Nếu không có → không hiển thị button
     */
    actionLabel?: string;

    /**
     * Callback khi click action button (optional)
     */
    onAction?: () => void;

    /**
     * Variant của button (optional)
     * Default: "default"
     */
    buttonVariant?: "default" | "outline" | "destructive" | "secondary";

    /**
     * Size của component (optional)
     * Default: "md"
     */
    size?: "sm" | "md" | "lg";
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    buttonVariant = "default",
    size = "md",
}) => {
    // Size classes
    const sizeClasses = {
        sm: {
            icon: "h-12 w-12",
            title: "text-lg",
            description: "text-sm",
            padding: "p-6",
        },
        md: {
            icon: "h-16 w-16",
            title: "text-xl",
            description: "text-base",
            padding: "p-8",
        },
        lg: {
            icon: "h-20 w-20",
            title: "text-2xl",
            description: "text-lg",
            padding: "p-10",
        },
    };

    const classes = sizeClasses[size];

    return (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className={`${classes.padding} flex flex-col items-center justify-center text-center`}>
                {/* Icon */}
                <div className="mb-4 text-gray-400">
                    <Icon className={classes.icon} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className={`${classes.title} font-semibold text-gray-900 mb-2`}>
                    {title}
                </h3>

                {/* Description */}
                {description && (
                    <p className={`${classes.description} text-gray-600 mb-6 max-w-md`}>
                        {description}
                    </p>
                )}

                {/* Action Button */}
                {actionLabel && onAction && (
                    <Button
                        onClick={onAction}
                        variant={buttonVariant}
                        className="mt-2"
                    >
                        {actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default EmptyState;









