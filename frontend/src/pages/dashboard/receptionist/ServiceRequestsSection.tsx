import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { ServiceRequestType } from "../../../../../shared/types";
import { formatVND } from "../../../utils/formatCurrency";
import { AlertCircle, Search, CheckCircle, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import useAppContext from "../../../hooks/useAppContext";

/**
 * ServiceRequestsSection Component
 * Quản lý service requests cho Receptionist (UC 8)
 */
const ServiceRequestsSection = () => {
    const { showToast } = useAppContext();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Fetch service requests
    const { data: serviceRequestsData, isLoading } = useQuery({
        queryKey: ["getAllServiceRequests", statusFilter, searchTerm],
        queryFn: () => apiClient.getAllServiceRequests({
            status: statusFilter !== "all" ? statusFilter : undefined,
        }),
    });

    // Update service request mutation
    const updateMutation = useMutation({
        mutationFn: ({ serviceRequestId, data }: { serviceRequestId: string; data: Partial<ServiceRequestType> }) =>
            apiClient.updateServiceRequest(serviceRequestId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getAllServiceRequests"] });
            showToast({
                title: "Cập nhật service request thành công!",
                description: "Trạng thái service request đã được cập nhật.",
                type: "SUCCESS",
            });
        },
        onError: (error: any) => {
            showToast({
                title: "Có lỗi xảy ra",
                description: error?.response?.data?.message || "Không thể cập nhật service request.",
                type: "ERROR",
            });
        },
    });

    // Backend có thể trả về array hoặc object với serviceRequests field
    const serviceRequests = Array.isArray(serviceRequestsData)
        ? serviceRequestsData
        : serviceRequestsData?.serviceRequests || [];

    // Filter service requests by search term
    const filteredRequests = serviceRequests.filter((request: ServiceRequestType) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            request.description.toLowerCase().includes(searchLower) ||
            request.serviceType.toLowerCase().includes(searchLower) ||
            request._id.toLowerCase().includes(searchLower)
        );
    });

    const handleUpdateStatus = (requestId: string, newStatus: string) => {
        updateMutation.mutate({
            serviceRequestId: requestId,
            data: { status: newStatus as any },
        });
    };

    const getStatusBadge = (status?: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            pending: { label: "Chờ xử lý", className: "bg-yellow-100 text-yellow-800" },
            in_progress: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800" },
            completed: { label: "Hoàn tất", className: "bg-green-100 text-green-800" },
            cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
        };
        const statusInfo = statusMap[status || "pending"] || statusMap.pending;
        return (
            <Badge className={`${statusInfo.className} border-2 border-black font-bold`}>
                {statusInfo.label}
            </Badge>
        );
    };

    const getServiceTypeLabel = (type: string) => {
        const typeMap: Record<string, string> = {
            room_service: "Dọn phòng",
            laundry: "Giặt ủi",
            cleaning: "Vệ sinh",
            food: "Đồ ăn",
            transport: "Vận chuyển",
            minibar: "Minibar",
            other: "Khác",
        };
        return typeMap[type] || type;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
                    <p className="text-lg font-bold">Loading service requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-black" strokeWidth={3} />
                    <h1 className="text-4xl font-black text-black uppercase">
                        Service Requests
                    </h1>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo mô tả, loại dịch vụ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-4 border-black font-bold"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border-4 border-black font-bold bg-white"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="completed">Hoàn tất</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>

            {/* Service Requests Table */}
            {filteredRequests.length > 0 ? (
                <div className="bg-white border-4 border-black overflow-hidden" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-black uppercase">Service Type</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Description</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Price</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Status</th>
                                    <th className="px-6 py-4 text-left font-black uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((request: ServiceRequestType) => (
                                    <tr key={request._id} className="border-b-2 border-black hover:bg-yellow-50">
                                        <td className="px-6 py-4 font-bold">
                                            {getServiceTypeLabel(request.serviceType)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm">{request.description}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            {request.price ? formatVND(request.price) : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {request.status === "pending" && (
                                                    <>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(request._id, "in_progress")}
                                                            className="bg-blue-100 border-2 border-black text-black font-bold hover:bg-blue-200"
                                                            style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                        >
                                                            Start
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(request._id, "completed")}
                                                            className="bg-green-100 border-2 border-black text-green-800 font-bold hover:bg-green-200"
                                                            style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Complete
                                                        </Button>
                                                    </>
                                                )}
                                                {request.status === "in_progress" && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(request._id, "completed")}
                                                        className="bg-green-100 border-2 border-black text-green-800 font-bold hover:bg-green-200"
                                                        style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Complete
                                                    </Button>
                                                )}
                                                {request.status !== "cancelled" && request.status !== "completed" && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(request._id, "cancelled")}
                                                        className="bg-red-100 border-2 border-black text-red-800 font-bold hover:bg-red-200"
                                                        style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Cancel
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
                <div className="bg-white border-4 border-black p-12 text-center" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-bold text-gray-600">Không có service requests nào</p>
                </div>
            )}
        </div>
    );
};

export default ServiceRequestsSection;

