import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { EmployeeType } from "../../../../../shared/types";
import { Users, Plus, Edit, Trash2, Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import useAppContext from "../../../hooks/useAppContext";
import { useUserStore } from "../../../stores/userStore";
import EmployeeForm from "../../../components/forms/EmployeeForm";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import { initSocket } from "../../../lib/socket";

/**
 * EmployeesSection Component
 * Quản lý nhân viên cho Owner (UC 13)
 * 
 * LƯU Ý: Component này dùng API /api/users để lấy TẤT CẢ users
 * (bao gồm cả employees và customers) thay vì /api/v2/employees
 */
const EmployeesSection = () => {
    const { showToast } = useAppContext();
    const { currentUser } = useUserStore();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<EmployeeType | null>(
        null
    );
    
    // Lấy companyId của owner hiện tại
    const ownerCompanyId = currentUser?.companyId;
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: "danger" | "warning" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    // Setup Socket.IO listeners
    useEffect(() => {
        const socket = initSocket();

        // Listen for user events (dùng user events thay vì employee events)
        socket.on("user:updated", () => {
            queryClient.invalidateQueries({ queryKey: ["getAllUsers"] });
        });

        socket.on("user:deleted", () => {
            queryClient.invalidateQueries({ queryKey: ["getAllUsers"] });
        });

        socket.on("user:activated", () => {
            queryClient.invalidateQueries({ queryKey: ["getAllUsers"] });
        });

        return () => {
            socket.off("user:updated");
            socket.off("user:deleted");
            socket.off("user:activated");
        };
    }, [queryClient]);

    // ============================================
    // FETCH EMPLOYEES TỪ BACKEND
    // ============================================
    // CHỈ LẤY EMPLOYEES (manager, receptionist) CÓ CÙNG companyId VỚI OWNER
    // Backend trả về: { message, users: [...], pagination: {...} }
    const { data: employeesData, isLoading } = useQuery({
        queryKey: ["getAllUsers", "employees", ownerCompanyId, roleFilter, statusFilter],
        queryFn: () =>
            apiClient.getAllUsers({
                // CHỈ LẤY EMPLOYEES (không lấy customers)
                // Nếu roleFilter = "all" → backend sẽ tự động filter employees khi có companyId
                role: roleFilter !== "all" ? roleFilter : undefined,
                // Lọc theo companyId của owner (chỉ lấy employees cùng công ty)
                companyId: ownerCompanyId || undefined,
                isActive: statusFilter !== "all" ? statusFilter === "active" : undefined,
                limit: 1000, // Lấy tất cả employees
            }),
        enabled: true, // Luôn fetch (nếu không có companyId, backend sẽ trả về tất cả employees)
    });

    // Delete employee mutation (Soft delete - Deactivate) - Dùng API users
    const deleteMutation = useMutation({
        mutationFn: apiClient.deleteUser,
        onSuccess: () => {
            showToast({
                title: "Employee Deactivated",
                description: "Employee has been deactivated successfully (soft delete).",
                type: "SUCCESS",
            });
            queryClient.invalidateQueries({ queryKey: ["getAllUsers"] });
        },
        onError: () => {
            showToast({
                title: "Deactivate Failed",
                description: "Failed to deactivate employee. Please try again.",
                type: "ERROR",
            });
        },
    });

    // Activate employee mutation - Dùng API users
    const activateMutation = useMutation({
        mutationFn: apiClient.activateUser,
        onSuccess: () => {
            showToast({
                title: "Employee Activated",
                description: "Employee has been activated successfully.",
                type: "SUCCESS",
            });
            queryClient.invalidateQueries({ queryKey: ["getAllUsers"] });
        },
        onError: () => {
            showToast({
                title: "Activate Failed",
                description: "Failed to activate employee. Please try again.",
                type: "ERROR",
            });
        },
    });

    // ============================================
    // XỬ LÝ DATA TỪ BACKEND
    // ============================================
    // Backend trả về: { message, users: [...], pagination: {...} }
    // Lấy mảng users từ response và filter CHỈ LẤY EMPLOYEES (manager, receptionist)
    const allUsers = Array.isArray(employeesData?.users)
        ? employeesData.users
        : Array.isArray(employeesData?.employees)
            ? employeesData.employees
            : Array.isArray(employeesData)
                ? employeesData
                : [];
    
    // CHỈ LẤY EMPLOYEES (manager, receptionist) - KHÔNG LẤY CUSTOMERS
    const employees = allUsers.filter((user: any) => {
        const isEmployee = ["manager", "receptionist", "hotel_owner"].includes(user.role);
        // Nếu có companyId, chỉ lấy employees cùng companyId với owner
        if (ownerCompanyId) {
            return isEmployee && user.companyId === ownerCompanyId;
        }
        // Nếu owner chưa có companyId, lấy tất cả employees
        return isEmployee;
    });
    
    // Filter theo search term
    const filteredEmployees = employees.filter((emp: EmployeeType) => {
        const matchesSearch =
            emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleDelete = (employeeId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Deactivate Employee",
            message: "Are you sure you want to deactivate this employee? (Soft delete - can be reactivated later)",
            variant: "danger",
            onConfirm: () => {
                deleteMutation.mutate(employeeId);
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    };

    const handleActivate = (employeeId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Activate Employee",
            message: "Are you sure you want to activate this employee?",
            variant: "info",
            onConfirm: () => {
                activateMutation.mutate(employeeId);
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    };

    // ============================================
    // LOADING STATE
    // ============================================
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
                    <p className="text-lg font-bold">Loading employees...</p>
                </div>
            </div>
        );
    }

    // Debug: Log để kiểm tra data
    console.log("📊 EmployeesSection Data:", {
        hasData: !!employeesData,
        employeesData,
        employeesCount: employees.length,
        filteredCount: filteredEmployees.length,
        firstEmployee: employees[0],
    });

    return (
        <div className="space-y-6">
            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant || "info"}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-black" strokeWidth={3} />
                    <h1 className="text-4xl font-black text-black uppercase">
                        Employees Management
                    </h1>
                </div>
                <Button
                    onClick={() => {
                        setEditingEmployee(null);
                        setShowAddForm(true);
                    }}
                    className="bg-yellow-100 border-4 border-black text-black font-black uppercase hover:bg-yellow-200"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Employee
                </Button>
            </div>

            {/* Filters */}
            <div
                className="bg-white border-4 border-black p-4"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-4 border-black font-bold"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="border-4 border-black px-4 py-2 font-bold bg-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="manager">Manager</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="hotel_owner">Owner</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border-4 border-black px-4 py-2 font-bold bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Employee Form Modal */}
            {(showAddForm || editingEmployee) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white border-4 border-black p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        style={{ boxShadow: "8px 8px 0px 0px #000" }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-black uppercase">
                                {editingEmployee ? "Edit Employee" : "Add New Employee"}
                            </h2>
                            <Button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingEmployee(null);
                                }}
                                variant="outline"
                                className="border-4 border-black"
                            >
                                ✕
                            </Button>
                        </div>
                        <EmployeeForm
                            employee={editingEmployee || undefined}
                            onSuccess={() => {
                                setShowAddForm(false);
                                setEditingEmployee(null);
                                queryClient.invalidateQueries({ queryKey: ["getAllUsers"] });
                            }}
                            onCancel={() => {
                                setShowAddForm(false);
                                setEditingEmployee(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Employees Table */}
            {filteredEmployees.length > 0 ? (
                <div
                    className="bg-white border-4 border-black overflow-hidden"
                    style={{ boxShadow: "8px 8px 0px 0px #000" }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        Phone
                                    </th>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((employee: EmployeeType) => (
                                    <tr
                                        key={employee._id}
                                        className="border-t-4 border-black hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-bold">
                                            {employee.firstName} {employee.lastName}
                                        </td>
                                        <td className="px-6 py-4">{employee.email}</td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={`border-2 border-black font-bold ${employee.role === "manager"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : employee.role === "receptionist"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {employee.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">{employee.phone || "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={`border-2 border-black font-bold ${employee.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {employee.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => {
                                                        setEditingEmployee(employee);
                                                        setShowAddForm(true);
                                                    }}
                                                    className="bg-blue-100 border-2 border-black text-black font-black p-2 hover:bg-blue-200"
                                                    style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                    title="Edit Employee"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                {employee.isActive ? (
                                                    <Button
                                                        onClick={() => handleDelete(employee._id)}
                                                        className="bg-red-100 border-2 border-black text-black font-black p-2 hover:bg-red-200"
                                                        style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                        title="Deactivate (Soft Delete)"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleActivate(employee._id)}
                                                        className="bg-green-100 border-2 border-black text-black font-black p-2 hover:bg-green-200"
                                                        style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                        title="Activate Employee"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div
                    className="bg-white border-4 border-black p-12 text-center"
                    style={{ boxShadow: "8px 8px 0px 0px #000" }}
                >
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-gray-600 mb-2">
                        No Employees Found
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm
                            ? "Try adjusting your search filters"
                            : "Start by adding your first employee"}
                    </p>
                    {!searchTerm && (
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="bg-yellow-100 border-4 border-black text-black font-black uppercase hover:bg-yellow-200"
                            style={{ boxShadow: "4px 4px 0px 0px #000" }}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Employee
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeesSection;

