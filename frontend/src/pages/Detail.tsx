import { useParams } from "react-router-dom";
import { useQueryWithLoading } from "../hooks/useLoadingHooks";
import * as apiClient from "./../api-client";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";
import { Badge } from "../components/ui/badge";
import { formatVND } from "../utils/formatCurrency";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Car,
  Wifi,
  Waves,
  Dumbbell,
  Sparkles,
  Plane,
  Building2,
  ChevronRight,
  X,
  ChevronLeft,
  Maximize2,
  Shield,
  Award,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "../components/ui/button";

const Detail = () => {
  const { hotelId } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const { data: hotel } = useQueryWithLoading(
    ["fetchHotelById", hotelId],
    () => apiClient.fetchHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
      loadingMessage: "Loading hotel details...",
    }
  );

  if (!hotel) {
    return (
      <div className="text-center text-lg text-gray-500 py-10">
        No hotel found.
      </div>
    );
  }

  const mainImage = hotel.imageUrls[0] || "";
  const otherImages = hotel.imageUrls.slice(1, 5) || [];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % hotel.imageUrls.length);
  };

  const prevImage = () => {
    setSelectedImageIndex(
      (prev) => (prev - 1 + hotel.imageUrls.length) % hotel.imageUrls.length
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Image Gallery */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span>{hotel.city}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{hotel.name}</span>
          </div>

          {/* Hotel Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <AiFillStar
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {hotel.starRating} Star Hotel
                  </Badge>
                  {hotel.isFeatured && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Award className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {hotel.name}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">
                      {hotel.city}, {hotel.country}
                    </span>
                  </div>
                  {hotel.averageRating && hotel.averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      <AiFillStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold">
                        {hotel.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({hotel.totalBookings || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-4 gap-2 h-[500px] rounded-xl overflow-hidden">
            {/* Main Image */}
            <div className="col-span-2 row-span-2 relative group cursor-pointer">
              <img
                src={hotel.imageUrls[selectedImageIndex] || mainImage}
                alt={hotel.name}
                className="w-full h-full object-cover"
                onClick={() => setShowImageModal(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize2 className="w-4 h-4" />
                View All Photos
              </button>
              {/* Navigation Arrows */}
              {hotel.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {otherImages.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImageIndex(index + 1)}
              >
                <img
                  src={image}
                  alt={`${hotel.name} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 transition-all ${selectedImageIndex === index + 1
                    ? "bg-black/20 ring-2 ring-blue-500"
                    : "bg-black/0 group-hover:bg-black/10"
                    }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Quick Info Bar */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatVND(hotel.pricePerNight)}
                  </div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {hotel.starRating}
                  </div>
                  <div className="text-sm text-gray-600">Star Rating</div>
                </div>
                {hotel.averageRating && hotel.averageRating > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                      <AiFillStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {hotel.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Guest Rating</div>
                  </div>
                )}
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {hotel.totalBookings || 0}
                  </div>
                  <div className="text-sm text-gray-600">Bookings</div>
                </div>
              </div>
            </div>

            {/* Hotel Types */}
            {hotel.type && hotel.type.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.type.map((type, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {hotel.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  About This Property
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {hotel.description}
                </p>
              </div>
            )}

            {/* Facilities */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Facilities & Amenities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotel.facilities.map((facility) => {
                  const iconMap: { [key: string]: any } = {
                    "Free WiFi": Wifi,
                    Parking: Car,
                    "Airport Shuttle": Plane,
                    "Swimming Pool": Waves,
                    Spa: Sparkles,
                    "Fitness Center": Dumbbell,
                    "Business Center": Building2,
                  };
                  const Icon = iconMap[facility] || Building2;

                  return (
                    <div
                      key={facility}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {facility}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            {hotel.policies && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Hotel Policies
                </h3>
                <div className="space-y-4">
                  {hotel.policies.checkInTime && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Check-in
                        </div>
                        <div className="text-gray-600">
                          {hotel.policies.checkInTime}
                        </div>
                      </div>
                    </div>
                  )}
                  {hotel.policies.checkOutTime && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Check-out
                        </div>
                        <div className="text-gray-600">
                          {hotel.policies.checkOutTime}
                        </div>
                      </div>
                    </div>
                  )}
                  {hotel.policies.cancellationPolicy && (
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Cancellation Policy
                        </div>
                        <div className="text-gray-600">
                          {hotel.policies.cancellationPolicy}
                        </div>
                      </div>
                    </div>
                  )}
                  {hotel.policies.petPolicy && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Pet Policy
                        </div>
                        <div className="text-gray-600">
                          {hotel.policies.petPolicy}
                        </div>
                      </div>
                    </div>
                  )}
                  {hotel.policies.smokingPolicy && (
                    <div className="flex items-start gap-3">
                      <X className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Smoking Policy
                        </div>
                        <div className="text-gray-600">
                          {hotel.policies.smokingPolicy}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {hotel.contact && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {hotel.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{hotel.contact.phone}</span>
                    </div>
                  )}
                  {hotel.contact.email && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{hotel.contact.email}</span>
                    </div>
                  )}
                  {hotel.contact.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a
                        href={hotel.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Booking Card */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <GuestInfoForm
                pricePerNight={hotel.pricePerNight}
                hotelId={hotel._id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-6xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={hotel.imageUrls[selectedImageIndex]}
              alt={hotel.name}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {hotel.imageUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm">
              {selectedImageIndex + 1} / {hotel.imageUrls.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
