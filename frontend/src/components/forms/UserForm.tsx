import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserType } from "../../../../shared/types";
import { useMutation } from "@tanstack/react-query";
import * as apiClient from "../../api-client";
import useAppContext from "../../hooks/useAppContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

/**
 * UserForm Component
 * Form để chỉnh sửa user (không cho tạo mới, chỉ edit)
 */
interface UserFormProps {
    user: UserType;
    onSuccess: () => void;
    onCancel: () => void;
}

// Zod schema cho validation
const userSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    firstName: z.string().min(1, "Tên là bắt buộc"),
    lastName: z.string().min(1, "Họ là bắt buộc"),
    role: z.enum(["user", "hotel_owner", "receptionist", "manager"]),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const UserForm = ({ user, onSuccess, onCancel }: UserFormProps) => {
    const { showToast } = useAppContext();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            email: user?.email || "",
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            role: user?.role || "user",
            phone: user?.phone || "",
            isActive: user?.isActive ?? true,
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<UserFormData>) =>
            apiClient.updateUser(user._id, data),
        onSuccess: () => {
            showToast({
                title: "User Updated",
                description: "User has been updated successfully.",
                type: "SUCCESS",
            });
            onSuccess();
        },
        onError: (error: any) => {
            showToast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update user.",
                type: "ERROR",
            });
        },
    });

    const onSubmit = (data: UserFormData) => {
        updateMutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName" className="font-bold">
                        First Name *
                    </Label>
                    <Input
                        id="firstName"
                        {...register("firstName")}
                        className="border-4 border-black mt-1"
                    />
                    {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="lastName" className="font-bold">
                        Last Name *
                    </Label>
                    <Input
                        id="lastName"
                        {...register("lastName")}
                        className="border-4 border-black mt-1"
                    />
                    {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                </div>
            </div>

            <div>
                <Label htmlFor="email" className="font-bold">
                    Email *
                </Label>
                <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="border-4 border-black mt-1"
                />
                {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="role" className="font-bold">
                        Role *
                    </Label>
                    <select
                        id="role"
                        {...register("role")}
                        className="w-full border-4 border-black px-4 py-2 mt-1 font-bold bg-white"
                    >
                        <option value="user">Customer</option>
                        <option value="receptionist">Receptionist</option>
                        <option value="manager">Manager</option>
                        <option value="hotel_owner">Owner</option>
                    </select>
                    {errors.role && (
                        <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="phone" className="font-bold">
                        Phone
                    </Label>
                    <Input
                        id="phone"
                        {...register("phone")}
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
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? "Updating..." : "Update User"}
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

export default UserForm;



