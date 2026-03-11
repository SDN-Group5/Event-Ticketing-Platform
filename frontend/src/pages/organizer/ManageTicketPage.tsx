import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import { EventAPI } from '../../services/eventApiService';
import { SeatAPI } from '../../services/seatApiService';
import { useAuth } from '../../contexts/AuthContext';
import type { EventLayout, LayoutZone } from '../../types/layout';

interface TicketStats {
  total: number;
  available: number;
  sold: number;
  reserved: number;
  blocked: number;
}

export const ManageTicketPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
        } catch (err) {
          console.error('Error fetching layout:', err);
          setError('Failed to load layout');
        }

        // Fetch event details
        try {
          const eventData = await EventAPI.getEventById(eventId);
          setEvent(eventData.data || eventData);
        } catch (err) {
          console.error('Error fetching event:', err);
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

  const filteredSeats = seats.filter(seat => {
    if (filterStatus === 'all') return true;
    return seat.status === filterStatus;
  });

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
      <div className="mb-8">
        <button
          onClick={() => navigate('/organizer/events')}
          className="text-[#8655f6] hover:text-[#7644e0] mb-4 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Events
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">Manage Tickets</h1>
        <p className="text-gray-400">{layout.eventName || 'Event Tickets'}</p>
      </div>

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
      {layout.zones && layout.zones.length > 0 && (
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
        ) : filteredSeats.length > 0 ? (
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
                {filteredSeats.map(seat => (
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
    </div>
  );
};
