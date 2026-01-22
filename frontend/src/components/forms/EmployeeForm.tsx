import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmployeeType } from "../../../../shared/types";
import { useMutation } from "@tanstack/react-query";
import * as apiClient from "../../api-client";
import useAppContext from "../../hooks/useAppContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

/**
 * EmployeeForm Component
 * Form để tạo hoặc chỉnh sửa nhân viên
 */
interface EmployeeFormProps {
  employee?: EmployeeType;
  onSuccess: () => void;
  onCancel: () => void;
}

// Zod schema cho validation
const employeeSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .optional()
    .or(z.literal("")),
  firstName: z.string().min(1, "Tên là bắt buộc"),
  lastName: z.string().min(1, "Họ là bắt buộc"),
  role: z.enum(["receptionist", "manager", "hotel_owner"]),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const EmployeeForm = ({ employee, onSuccess, onCancel }: EmployeeFormProps) => {
  const { showToast } = useAppContext();
  const isEditing = !!employee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      email: employee?.email || "",
      firstName: employee?.firstName || "",
      lastName: employee?.lastName || "",
      role: employee?.role || "receptionist",
      phone: employee?.phone || "",
      isActive: employee?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: apiClient.createEmployee,
    onSuccess: () => {
      showToast({
        title: "Employee Created",
        description: "Employee has been created successfully.",
        type: "SUCCESS",
      });
      onSuccess();
    },
    onError: (error: any) => {
      showToast({
        title: "Create Failed",
        description: error.response?.data?.message || "Failed to create employee.",
        type: "ERROR",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<EmployeeFormData>) =>
      apiClient.updateUser(employee!._id, data),
    onSuccess: () => {
      showToast({
        title: "Employee Updated",
        description: "Employee has been updated successfully.",
        type: "SUCCESS",
      });
      onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update employee.";
      const statusCode = error.response?.status;

      // Hiển thị lỗi chi tiết hơn
      let description = errorMessage;
      if (statusCode === 401) {
        description = "Unauthorized: Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.";
      } else if (statusCode === 403) {
        description = "Forbidden: Bạn không có quyền cập nhật employee này.";
      } else if (statusCode === 404) {
        description = "Not Found: Không tìm thấy employee.";
      }

      showToast({
        title: "Update Failed",
        description: description,
        type: "ERROR",
      });

      // Log chi tiết để debug
      console.error("❌ Update Employee Error:", {
        status: statusCode,
        message: errorMessage,
        response: error.response?.data,
      });
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    if (isEditing) {
      // Update - xử lý password riêng
      const updateData: any = { ...data };

      // Nếu có password mới → update password qua API riêng
      if (data.password && data.password !== "") {
        try {
          await apiClient.updateUserPassword(employee!._id, data.password);
        } catch (error: any) {
          showToast({
            title: "Password Update Failed",
            description: error.response?.data?.message || "Failed to update password.",
            type: "ERROR",
          });
          return;
        }
      }

      // Xóa password khỏi updateData (backend không nhận password qua endpoint này)
      delete updateData.password;

      // Update các thông tin khác
      updateMutation.mutate(updateData);
    } else {
      // Create - password là bắt buộc
      if (!data.password || data.password === "") {
        showToast({
          title: "Validation Error",
          description: "Password is required for new employees.",
          type: "ERROR",
        });
        return;
      }
      createMutation.mutate({
        ...data,
        password: data.password!,
      });
    }
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

      <div>
        <Label htmlFor="password" className="font-bold">
          Password {isEditing ? "(Leave empty to keep current)" : "*"}
        </Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          className="border-4 border-black mt-1"
        />
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
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
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : isEditing
              ? "Update Employee"
              : "Create Employee"}
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

export default EmployeeForm;

