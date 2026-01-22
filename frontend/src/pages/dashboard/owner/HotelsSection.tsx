import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as apiClient from "../../../api-client";
import { formatVND } from "../../../utils/formatCurrency";
import { Hotel, Plus, Edit } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

/**
 * HotelsSection Component
 * Quản lý danh sách khách sạn của Owner (UC 11)
 */
const HotelsSection = () => {
    const { data: hotels, isLoading } = useQuery({
        queryKey: ["fetchMyHotels"],
        queryFn: apiClient.fetchMyHotels,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
                    <p className="text-lg font-bold">Loading hotels...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Hotel className="w-8 h-8 text-black" strokeWidth={3} />
                    <h1 className="text-4xl font-black text-black uppercase">
                        My Hotels
                    </h1>
                </div>
                <Link to="/add-hotel">
                    <Button
                        className="bg-yellow-100 border-4 border-black text-black font-black uppercase hover:bg-yellow-200"
                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Hotel
                    </Button>
                </Link>
            </div>

            {/* Hotels Grid */}
            {hotels && hotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <div
                            key={hotel._id}
                            className="bg-white border-4 border-black overflow-hidden"
                            style={{ boxShadow: "8px 8px 0px 0px #000" }}
                        >
                            {/* Hotel Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={hotel.imageUrls[0] || "/placeholder-hotel.jpg"}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-white/90 backdrop-blur-sm border-2 border-black font-black">
                                        {hotel.starRating} ⭐
                                    </Badge>
                                </div>
                            </div>

                            {/* Hotel Info */}
                            <div className="p-6">
                                <h3 className="text-xl font-black text-black mb-2">
                                    {hotel.name}
                                </h3>
                                <p className="text-gray-600 font-medium mb-3">
                                    {hotel.city}, {hotel.country}
                                </p>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl font-black text-black">
                                        {formatVND(hotel.pricePerNight)}
                                    </span>
                                    <span className="text-sm text-gray-600">/ đêm</span>
                                </div>

                                {/* Hotel Types */}
                                {hotel.type && hotel.type.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {hotel.type.slice(0, 2).map((type, index) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                                className="border-2 border-black text-xs font-bold"
                                            >
                                                {type}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        to={`/edit-hotel/${hotel._id}`}
                                        className="flex-1 bg-blue-100 border-4 border-black text-black font-black uppercase py-2 px-4 text-center hover:bg-blue-200 transition-colors"
                                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                                    >
                                        <Edit className="w-4 h-4 inline mr-2" />
                                        Edit
                                    </Link>
                                    <Link
                                        to={`/detail/${hotel._id}`}
                                        className="flex-1 bg-green-100 border-4 border-black text-black font-black uppercase py-2 px-4 text-center hover:bg-green-200 transition-colors"
                                        style={{ boxShadow: "4px 4px 0px 0px #000" }}
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className="bg-white border-4 border-black p-12 text-center"
                    style={{ boxShadow: "8px 8px 0px 0px #000" }}
                >
                    <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-gray-600 mb-2">
                        No Hotels Yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Start by adding your first hotel to the platform
                    </p>
                    <Link to="/add-hotel">
                        <Button
                            className="bg-yellow-100 border-4 border-black text-black font-black uppercase hover:bg-yellow-200"
                            style={{ boxShadow: "4px 4px 0px 0px #000" }}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Your First Hotel
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default HotelsSection;

