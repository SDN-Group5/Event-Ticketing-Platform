import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PromotionType } from "../../../../shared/types";
import { useMutation } from "@tanstack/react-query";
import * as apiClient from "../../api-client";
import useAppContext from "../../hooks/useAppContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

/**
 * PromotionForm Component
 * Form để tạo hoặc chỉnh sửa khuyến mãi
 */
interface PromotionFormProps {
    promotion?: PromotionType;
    onSuccess: () => void;
    onCancel: () => void;
}

// Zod schema cho validation
const promotionSchema = z.object({
    name: z.string().min(1, "Tên khuyến mãi là bắt buộc"),
    description: z.string().min(1, "Mô tả là bắt buộc"),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.number().min(0, "Giá trị giảm giá phải >= 0"),
    startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
    endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
    hotelId: z.string().optional(),
    minStay: z.number().min(1).optional(),
    maxUsage: z.number().min(1).optional(),
    isActive: z.boolean().optional(),
}).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
}, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
});

type PromotionFormData = z.infer<typeof promotionSchema>;

const PromotionForm = ({ promotion, onSuccess, onCancel }: PromotionFormProps) => {
    const { showToast } = useAppContext();
    const isEditing = !!promotion;

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PromotionFormData>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            name: promotion?.name || "",
            description: promotion?.description || "",
            discountType: promotion?.discountType || "PERCENTAGE",
            discountValue: promotion?.discountValue || 0,
            startDate: promotion?.startDate
                ? new Date(promotion.startDate).toISOString().split("T")[0]
                : "",
            endDate: promotion?.endDate
                ? new Date(promotion.endDate).toISOString().split("T")[0]
                : "",
            hotelId: promotion?.hotelId || "",
            minStay: promotion?.minStay || undefined,
            maxUsage: promotion?.maxUsage || undefined,
            isActive: promotion?.isActive ?? true,
        },
    });

    const discountType = watch("discountType");

    const createMutation = useMutation({
        mutationFn: apiClient.createPromotion,
        onSuccess: () => {
            showToast({
                title: "Promotion Created",
                description: "Promotion has been created successfully.",
                type: "SUCCESS",
            });
            onSuccess();
        },
        onError: (error: any) => {
            showToast({
                title: "Create Failed",
                description: error.response?.data?.message || "Failed to create promotion.",
                type: "ERROR",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<PromotionFormData>) =>
            apiClient.updatePromotion(promotion!._id, data),
        onSuccess: () => {
            showToast({
                title: "Promotion Updated",
                description: "Promotion has been updated successfully.",
                type: "SUCCESS",
            });
            onSuccess();
        },
        onError: (error: any) => {
            showToast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update promotion.",
                type: "ERROR",
            });
        },
    });

    const onSubmit = (data: PromotionFormData) => {
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate({
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <Label htmlFor="name" className="font-bold">
                    Promotion Name *
                </Label>
                <Input
                    id="name"
                    {...register("name")}
                    className="border-4 border-black mt-1"
                    placeholder="e.g., Summer Sale 2025"
                />
                {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                )}
            </div>

            <div>
                <Label htmlFor="description" className="font-bold">
                    Description *
                </Label>
                <textarea
                    id="description"
                    {...register("description")}
                    className="w-full border-4 border-black px-4 py-2 mt-1 font-bold min-h-[100px]"
                    placeholder="Describe your promotion..."
                />
                {errors.description && (
                    <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="discountType" className="font-bold">
                        Discount Type *
                    </Label>
                    <select
                        id="discountType"
                        {...register("discountType")}
                        className="w-full border-4 border-black px-4 py-2 mt-1 font-bold bg-white"
                    >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED_AMOUNT">Fixed Amount (£)</option>
                    </select>
                </div>

                <div>
                    <Label htmlFor="discountValue" className="font-bold">
                        Discount Value *
                    </Label>
                    <Input
                        id="discountValue"
                        type="number"
                        step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                        min="0"
                        {...register("discountValue", { valueAsNumber: true })}
                        className="border-4 border-black mt-1"
                        placeholder={discountType === "PERCENTAGE" ? "e.g., 20" : "e.g., 50000"}
                    />
                    {errors.discountValue && (
                        <p className="text-red-600 text-sm mt-1">{errors.discountValue.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="startDate" className="font-bold">
                        Start Date *
                    </Label>
                    <Input
                        id="startDate"
                        type="date"
                        {...register("startDate")}
                        className="border-4 border-black mt-1"
                    />
                    {errors.startDate && (
                        <p className="text-red-600 text-sm mt-1">{errors.startDate.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="endDate" className="font-bold">
                        End Date *
                    </Label>
                    <Input
                        id="endDate"
                        type="date"
                        {...register("endDate")}
                        className="border-4 border-black mt-1"
                    />
                    {errors.endDate && (
                        <p className="text-red-600 text-sm mt-1">{errors.endDate.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="minStay" className="font-bold">
                        Minimum Stay (nights)
                    </Label>
                    <Input
                        id="minStay"
                        type="number"
                        min="1"
                        {...register("minStay", { valueAsNumber: true })}
                        className="border-4 border-black mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="maxUsage" className="font-bold">
                        Max Usage (times)
                    </Label>
                    <Input
                        id="maxUsage"
                        type="number"
                        min="1"
                        {...register("maxUsage", { valueAsNumber: true })}
                        className="border-4 border-black mt-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isActive"
                    {...register("isActive")}
                    className="w-5 h-5 border-4 border-black"
                />
                <Label htmlFor="isActive" className="font-bold">
                    Active
                </Label>
            </div>

            <div className="flex gap-4">
                <Button
                    type="submit"
                    className="flex-1 bg-green-100 border-4 border-black text-black font-black uppercase hover:bg-green-200"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : isEditing
                            ? "Update Promotion"
                            : "Create Promotion"}
                </Button>
                <Button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 border-4 border-black text-black font-black uppercase hover:bg-gray-200"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default PromotionForm;

