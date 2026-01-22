import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as apiClient from "../../../api-client";
import { PromotionType } from "../../../../../shared/types";
import { formatVND } from "../../../utils/formatCurrency";
import { Tag, Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import useAppContext from "../../../hooks/useAppContext";
import PromotionForm from "../../../components/forms/PromotionForm";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

/**
 * PromotionsSection Component
 * Quản lý khuyến mãi cho Owner (UC 12)
 */
const PromotionsSection = () => {
    const { showToast } = useAppContext();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<PromotionType | null>(
        null
    );
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

    // Fetch promotions
    const { data: promotionsData, isLoading } = useQuery({
        queryKey: ["getAllPromotions", statusFilter],
        queryFn: () =>
            apiClient.getAllPromotions({
                isActive: statusFilter !== "all" ? statusFilter === "active" : undefined,
            }),
    });

    // Delete promotion mutation
    const deleteMutation = useMutation({
        mutationFn: apiClient.deletePromotion,
        onSuccess: () => {
            showToast({
                title: "Promotion Deleted",
                description: "Promotion has been deleted successfully.",
                type: "SUCCESS",
            });
            queryClient.invalidateQueries({ queryKey: ["getAllPromotions"] });
        },
        onError: () => {
            showToast({
                title: "Delete Failed",
                description: "Failed to delete promotion. Please try again.",
                type: "ERROR",
            });
        },
    });

    // Backend trả về: { message, count, promotions: [...] }
    const promotions = Array.isArray(promotionsData?.promotions)
        ? promotionsData.promotions
        : Array.isArray(promotionsData)
            ? promotionsData
            : [];
    const filteredPromotions = promotions.filter((promo: PromotionType) => {
        const matchesSearch = promo.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleDelete = (promotionId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Promotion",
            message: "Are you sure you want to delete this promotion?",
            variant: "danger",
            onConfirm: () => {
                deleteMutation.mutate(promotionId);
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    };

    const isActive = (promo: PromotionType) => {
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        return promo.isActive && now >= start && now <= end;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
                    <p className="text-lg font-bold">Loading promotions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant || "danger"}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Tag className="w-8 h-8 text-black" strokeWidth={3} />
                    <h1 className="text-4xl font-black text-black uppercase">
                        Promotions Management
                    </h1>
                </div>
                <Button
                    onClick={() => {
                        setEditingPromotion(null);
                        setShowAddForm(true);
                    }}
                    className="bg-yellow-100 border-4 border-black text-black font-black uppercase hover:bg-yellow-200"
                    style={{ boxShadow: "4px 4px 0px 0px #000" }}
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Promotion
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
                            placeholder="Search promotions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-4 border-black font-bold"
                        />
                    </div>
                    <div className="flex items-center gap-2">
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

            {/* Promotion Form Modal */}
            {(showAddForm || editingPromotion) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-white border-4 border-black p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        style={{ boxShadow: "8px 8px 0px 0px #000" }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-black uppercase">
                                {editingPromotion ? "Edit Promotion" : "Add New Promotion"}
                            </h2>
                            <Button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingPromotion(null);
                                }}
                                variant="outline"
                                className="border-4 border-black"
                            >
                                ✕
                            </Button>
                        </div>
                        <PromotionForm
                            promotion={editingPromotion || undefined}
                            onSuccess={() => {
                                setShowAddForm(false);
                                setEditingPromotion(null);
                                queryClient.invalidateQueries({ queryKey: ["getAllPromotions"] });
                            }}
                            onCancel={() => {
                                setShowAddForm(false);
                                setEditingPromotion(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Promotions Table */}
            {filteredPromotions.length > 0 ? (
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
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        Value
                                    </th>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                                        End Date
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
                                {filteredPromotions.map((promo: PromotionType) => (
                                    <tr
                                        key={promo._id}
                                        className="border-t-4 border-black hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 font-bold">{promo.name}</td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={`border-2 border-black font-bold ${promo.discountType === "PERCENTAGE"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-green-100 text-green-800"
                                                    }`}
                                            >
                                                {promo.discountType}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            {promo.discountType === "PERCENTAGE"
                                                ? `${promo.discountValue}%`
                                                : formatVND(promo.discountValue)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(promo.startDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(promo.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={`border-2 border-black font-bold ${isActive(promo)
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {isActive(promo) ? "Active" : "Inactive"}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => {
                                                        setEditingPromotion(promo);
                                                        setShowAddForm(true);
                                                    }}
                                                    className="bg-blue-100 border-2 border-black text-black font-black p-2 hover:bg-blue-200"
                                                    style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(promo._id)}
                                                    className="bg-red-100 border-2 border-black text-black font-black p-2 hover:bg-red-200"
                                                    style={{ boxShadow: "2px 2px 0px 0px #000" }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                    <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-gray-600 mb-2">
                        No Promotions Found
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm
                            ? "Try adjusting your search filters"
                            : "Start by creating your first promotion"}
                    </p>
                    {!searchTerm && (
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="bg-yellow-100 border-4 border-black text-black font-black uppercase hover:bg-yellow-200"
                            style={{ boxShadow: "4px 4px 0px 0px #000" }}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Promotion
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PromotionsSection;

