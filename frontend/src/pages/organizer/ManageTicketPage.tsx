import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import { SeatAPI } from '../../services/seatApiService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/ToastProvider';
import type { EventLayout, LayoutZone } from '../../types/layout';

interface TicketStats {
  total: number;
  available: number;
  sold: number;
  reserved: number;
  blocked: number;
}

interface TicketImage {
  [zoneId: string]: string; // zoneId -> base64Image
}

export const ManageTicketPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [layout, setLayout] = useState<EventLayout | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    total: 0,
    available: 0,
    sold: 0,
    reserved: 0,
    blocked: 0
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'sold' | 'reserved' | 'blocked'>('all');
  const [ticketImages, setTicketImages] = useState<TicketImage>({});
  const [savedTicketImages, setSavedTicketImages] = useState<TicketImage>({});
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'design'>('list');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!eventId) {
          setError('Event ID is required');
          return;
        }

        // Fetch layout
        try {
          const layoutData = await LayoutAPI.getLayout(eventId);
          setLayout(layoutData);
          
          // Set first zone as selected
          if (layoutData.zones && layoutData.zones.length > 0) {
            setSelectedZone(layoutData.zones[0].id);
          }

          // Load mocked ticket designs since Event API is disabled
          const stored = localStorage.getItem(`ticket_designs_${eventId}`);
          if (stored) {
            setSavedTicketImages(JSON.parse(stored));
          }
        } catch (err) {
          console.error('Error fetching layout:', err);
          setError('Failed to load layout');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!eventId || !selectedZone) return;

      try {
        setSeatsLoading(true);
        const data = await SeatAPI.getSeatsByZone(eventId, selectedZone);
        setSeats(data.seats || []);
        
        // Calculate stats
        const stats: TicketStats = {
          total: data.seats?.length || 0,
          available: data.seats?.filter((s: any) => s.status === 'available').length || 0,
          sold: data.seats?.filter((s: any) => s.status === 'sold').length || 0,
          reserved: data.seats?.filter((s: any) => s.status === 'reserved').length || 0,
          blocked: data.seats?.filter((s: any) => s.status === 'blocked').length || 0,
        };
        setTicketStats(stats);
      } catch (err) {
        console.error('Error fetching seats:', err);
        setSeats([]);
      } finally {
        setSeatsLoading(false);
      }
    };

    fetchSeats();
  }, [eventId, selectedZone]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, zoneId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setTicketImages(prev => ({
        ...prev,
        [zoneId]: base64
      }));
      showToast('Image uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTicketImage = async (zoneId: string) => {
    if (!ticketImages[zoneId]) {
      showToast('Please select an image first', 'error');
      return;
    }

    setUploading(true);
    try {
      // Feature disabled since EventService is removed, mock saving via localStorage:
      const newSaved = {
        ...savedTicketImages,
        [zoneId]: ticketImages[zoneId]
      };
      setSavedTicketImages(newSaved);
      localStorage.setItem(`ticket_designs_${eventId}`, JSON.stringify(newSaved));
      
      showToast('Ticket image saved successfully!', 'success');
      setEditingZoneId(null);
    } catch (err: any) {
      console.error('Error saving ticket image:', err);
      showToast('Failed to save ticket image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeTicketImage = (zoneId: string) => {
    setTicketImages(prev => {
      const newImages = { ...prev };
      delete newImages[zoneId];
      return newImages;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sold':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'reserved':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'blocked':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return 'check_circle';
      case 'sold':
        return 'done_all';
      case 'reserved':
        return 'schedule';
      case 'blocked':
        return 'cancel';
      default:
        return 'help';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">confirmation_number</span>
        <h2 className="text-xl font-semibold text-gray-400 mb-2">No layout found</h2>
        <p className="text-gray-500 mb-6">This event doesn't have a layout yet.</p>
        <button
          onClick={() => navigate('/organizer/events')}
          className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/organizer/events')}
            className="text-[#8655f6] hover:text-[#7644e0] mb-4 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Events
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Tickets</h1>
          <p className="text-gray-400">{layout?.eventName || 'Event Tickets'}</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
            }`}
          >
            <span className="material-symbols-outlined text-sm mr-2 inline">confirmation_number</span>
            Seat List
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'design'
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
            }`}
          >
            <span className="material-symbols-outlined text-sm mr-2 inline">image</span>
            Ticket Design
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' ? (
        // Seat List Tab
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-[#2a2436] rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">TOTAL</p>
              <p className="text-2xl font-bold text-white">{ticketStats.total}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-xs text-green-400 mb-2">AVAILABLE</p>
              <p className="text-2xl font-bold text-green-400">{ticketStats.available}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-xs text-blue-400 mb-2">SOLD</p>
              <p className="text-2xl font-bold text-blue-400">{ticketStats.sold}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-xs text-yellow-400 mb-2">RESERVED</p>
              <p className="text-2xl font-bold text-yellow-400">{ticketStats.reserved}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-xs text-red-400 mb-2">BLOCKED</p>
              <p className="text-2xl font-bold text-red-400">{ticketStats.blocked}</p>
            </div>
          </div>

          {/* Zone Selection */}
          {layout?.zones && layout.zones.length > 0 && (
            <div className="bg-[#2a2436] rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">layers</span>
                Select Zone
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {layout.zones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedZone === zone.id
                        ? 'bg-[#8655f6] text-white'
                        : 'bg-[#3a3447] text-gray-300 hover:bg-[#3a3447]/80'
                    }`}
                  >
                    <p className="font-semibold text-sm">{zone.name || 'Unnamed Zone'}</p>
                    <p className="text-xs text-gray-400/70 mt-1">{zone.rows ? zone.rows * (zone.seatsPerRow || 0) : 'N/A'} seats</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'available', 'sold', 'reserved', 'blocked'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filterStatus === status
                    ? 'bg-[#8655f6] text-white'
                    : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Seats Table */}
          <div className="bg-[#2a2436] rounded-xl overflow-hidden">
            {seatsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8655f6]"></div>
              </div>
            ) : seats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#4a4457] bg-[#3a3447]">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Row</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Seat</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Label</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seats.filter(s => 
                      filterStatus === 'all' ? true : s.status === filterStatus
                    ).map(seat => (
                      <tr key={seat._id} className="border-b border-[#4a4457] hover:bg-[#3a3447] transition-colors">
                        <td className="px-6 py-3 text-sm text-white">{seat.row}</td>
                        <td className="px-6 py-3 text-sm text-white">{seat.seatNumber}</td>
                        <td className="px-6 py-3 text-sm text-white font-semibold">{seat.seatLabel}</td>
                        <td className="px-6 py-3 text-sm text-white">{seat.price ? `${seat.price} đ` : 'N/A'}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit border ${getStatusColor(seat.status)}`}>
                            <span className="material-symbols-outlined text-xs">{getStatusIcon(seat.status)}</span>
                            {seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-400">
                          {seat.status === 'sold' && seat.soldAt && (
                            <span>Sold: {new Date(seat.soldAt).toLocaleDateString()}</span>
                          )}
                          {seat.status === 'reserved' && seat.reservedAt && (
                            <span>Reserved: {new Date(seat.reservedAt).toLocaleDateString()}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No seats found for this filter
              </div>
            )}
          </div>
        </>
      ) : (
        // Ticket Design Tab
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-300">
              <span className="material-symbols-outlined text-sm mr-2 inline">info</span>
              Customize ticket images for each zone. These images will be displayed on tickets when customers access their bookings.
            </p>
          </div>

          {layout?.zones && layout.zones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {layout.zones.map(zone => (
                <div key={zone.id} className="bg-[#2a2436] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{zone.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {zone.price ? `${zone.price} đ` : 'No price'}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: zone.color }}
                    />
                  </div>

                  {editingZoneId === zone.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      {ticketImages[zone.id] ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-900">
                            <img
                              src={ticketImages[zone.id]}
                              alt={zone.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeTicketImage(zone.id)}
                            className="w-full px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <label className="block cursor-pointer">
                          <div className="border-2 border-dashed border-[#8655f6] rounded-lg p-8 text-center hover:bg-[#8655f6]/5 transition-colors">
                            <span className="material-symbols-outlined text-4xl text-[#8655f6] mb-2 inline-block">image</span>
                            <p className="text-white font-medium">Click to upload image</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, zone.id)}
                            className="hidden"
                          />
                        </label>
                      )}

                      <div className="flex gap-2 pt-4 border-t border-[#4a4457]">
                        <button
                          onClick={() => handleSaveTicketImage(zone.id)}
                          disabled={!ticketImages[zone.id] || uploading}
                          className="flex-1 px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                          {uploading ? 'Saving...' : 'Save Image'}
                        </button>
                        <button
                          onClick={() => setEditingZoneId(null)}
                          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-3">
                      {savedTicketImages[zone.id] ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-900">
                            <img
                              src={savedTicketImages[zone.id]}
                              alt={zone.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-green-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Image uploaded
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-[#3a3447] rounded-lg text-center">
                          <span className="material-symbols-outlined text-3xl text-gray-500 inline-block mb-2">image_not_supported</span>
                          <p className="text-sm text-gray-400">No image set for this ticket</p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setEditingZoneId(zone.id);
                          // pre-fill the edit view with the saved image if there isn't a draft
                          if (!ticketImages[zone.id] && savedTicketImages[zone.id]) {
                            setTicketImages(prev => ({ ...prev, [zone.id]: savedTicketImages[zone.id] }));
                          }
                        }}
                        className="w-full px-4 py-2 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        {savedTicketImages[zone.id] ? 'Change Image' : 'Set Image'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <span className="material-symbols-outlined text-6xl inline-block mb-4">image</span>
              <p>No zones available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
