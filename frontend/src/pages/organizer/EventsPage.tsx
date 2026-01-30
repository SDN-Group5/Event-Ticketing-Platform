import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface OrganizerEvent {
  id: string;
  name: string;
  image: string;
  date: string;
  location: string;
  ticketsSold: number;
  totalCapacity: number;
  revenue: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
}

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    // TODO: Fetch organizer's events from API
    // const fetchEvents = async () => {
    //   try {
    //     const response = await fetch('/api/organizer/events');
    //     const data = await response.json();
    //     setEvents(data);
    //   } catch (error) {
    //     console.error('Error fetching events:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchEvents();

    // Mock data
    setEvents([
      {
        id: '1',
        name: 'Summer Music Festival',
        image: 'https://via.placeholder.com/400x250',
        date: '2024-06-15',
        location: 'Ho Chi Minh City',
        ticketsSold: 850,
        totalCapacity: 1000,
        revenue: 425000000,
        status: 'published',
      },
      {
        id: '2',
        name: 'Tech Conference 2024',
        image: 'https://via.placeholder.com/400x250',
        date: '2024-05-20',
        location: 'Hanoi',
        ticketsSold: 320,
        totalCapacity: 500,
        revenue: 96000000,
        status: 'ongoing',
      },
      {
        id: '3',
        name: 'Art Exhibition',
        image: 'https://via.placeholder.com/400x250',
        date: '2024-04-10',
        location: 'Da Nang',
        ticketsSold: 450,
        totalCapacity: 600,
        revenue: 45000000,
        status: 'completed',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400';
      case 'published':
        return 'bg-green-500/20 text-green-400';
      case 'ongoing':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return 'draft';
      case 'published':
        return 'check_circle';
      case 'ongoing':
        return 'radio_button_checked';
      case 'completed':
        return 'done_all';
      case 'cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  const fillPercentage = (sold: number, total: number) => (sold / total) * 100;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
          <p className="text-gray-400">Manage and monitor your events</p>
        </div>
        <button
          onClick={() => navigate('/organizer/create-event')}
          className="px-6 py-3 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Create Event
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'draft', 'published', 'ongoing', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === status
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">event</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No events found</h2>
          <p className="text-gray-500 mb-6">You haven't created any events yet.</p>
          <button
            onClick={() => navigate('/organizer/create-event')}
            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.01]"
            >
              <div className="flex flex-col md:flex-row">
                {/* Event Image */}
                <div className="md:w-48 h-40 flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Event Info */}
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{event.name}</h3>
                      <div className="flex flex-wrap gap-3 text-gray-400 text-sm mt-2">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {event.location}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 flex-shrink-0 ${getStatusColor(event.status)}`}>
                      <span className="material-symbols-outlined text-sm">{getStatusIcon(event.status)}</span>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </div>
                  </div>

                  {/* Tickets Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Ticket Sales</span>
                      <span className="text-white font-semibold text-sm">
                        {event.ticketsSold} / {event.totalCapacity}
                      </span>
                    </div>
                    <div className="w-full bg-[#3a3447] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#8655f6] to-[#d946ef] h-2 rounded-full transition-all"
                        style={{ width: `${fillPercentage(event.ticketsSold, event.totalCapacity)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Revenue</p>
                      <p className="text-white font-bold">{(event.revenue / 1000000).toFixed(1)}M đ</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Occupancy</p>
                      <p className="text-white font-bold">{fillPercentage(event.ticketsSold, event.totalCapacity).toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg text-sm transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-[#3a3447] hover:bg-[#3a3447]/80 text-gray-300 rounded-lg text-sm transition-colors">
                      Edit
                    </button>
                    {event.status === 'draft' && (
                      <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors">
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
