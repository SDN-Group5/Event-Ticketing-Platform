import React, { useState, useEffect } from 'react';

interface EventApproval {
  id: string;
  organizer: string;
  eventName: string;
  date: string;
  location: string;
  category: string;
  ticketPrice: number;
  estimatedCapacity: number;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export const EventApprovalsPage: React.FC = () => {
  const [events, setEvents] = useState<EventApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedEvent, setSelectedEvent] = useState<EventApproval | null>(null);

  useEffect(() => {
    // TODO: Fetch events for approval from API
    // const fetchEvents = async () => {
    //   try {
    //     const response = await fetch('/api/admin/event-approvals');
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
        organizer: 'Event Organizer A',
        eventName: 'Tech Summit 2024',
        date: '2024-04-15',
        location: 'Ho Chi Minh City Convention Center',
        category: 'Technology',
        ticketPrice: 1500000,
        estimatedCapacity: 2000,
        submittedDate: '2024-01-25',
        status: 'pending',
      },
      {
        id: '2',
        organizer: 'Music Agency B',
        eventName: 'Jazz Night Concert',
        date: '2024-03-20',
        location: 'Saigon Saigon Hotel',
        category: 'Music',
        ticketPrice: 800000,
        estimatedCapacity: 500,
        submittedDate: '2024-01-22',
        status: 'approved',
      },
      {
        id: '3',
        organizer: 'Sports Organization C',
        eventName: 'Football Championship',
        date: '2024-05-10',
        location: 'My Dinh Stadium',
        category: 'Sports',
        ticketPrice: 500000,
        estimatedCapacity: 40000,
        submittedDate: '2024-01-20',
        status: 'rejected',
        reason: 'Incomplete documentation for safety regulations',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredEvents = events.filter(event => event.status === filter);

  const handleApprove = (id: string) => {
    setEvents(events.map(e =>
      e.id === id ? { ...e, status: 'approved' } : e
    ));
    setSelectedEvent(null);
  };

  const handleReject = (id: string, reason: string) => {
    if (!reason) {
      alert('Please provide a reason for rejection');
      return;
    }
    setEvents(events.map(e =>
      e.id === id ? { ...e, status: 'rejected', reason } : e
    ));
    setSelectedEvent(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'approved':
        return 'check_circle';
      case 'rejected':
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

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Event Approvals</h1>
        <p className="text-gray-400">Review and approve event submissions</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['pending', 'approved', 'rejected'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${filter === status
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({events.filter(e => e.status === status).length})
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">event_available</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No events to show</h2>
          <p className="text-gray-500">
            {filter === 'pending' ? 'No pending events for approval.' : `No ${filter} events yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">{event.eventName}</h3>
                        <p className="text-gray-400 text-sm mt-1">By {event.organizer}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#3a3447] text-gray-300">
                        {event.category}
                      </span>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(event.status)}`}>
                        <span className="material-symbols-outlined text-sm">{getStatusIcon(event.status)}</span>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Date</p>
                        <p className="text-white font-semibold">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Location</p>
                        <p className="text-white font-semibold text-xs">{event.location}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Ticket Price</p>
                        <p className="text-white font-semibold">{(event.ticketPrice / 1000000).toFixed(1)}M đ</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Capacity</p>
                        <p className="text-white font-semibold">{event.estimatedCapacity.toLocaleString()}</p>
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs mt-4">
                      Submitted: {new Date(event.submittedDate).toLocaleDateString()}
                    </p>

                    {event.reason && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm font-semibold mb-1">Rejection Reason:</p>
                        <p className="text-red-300 text-sm">{event.reason}</p>
                      </div>
                    )}
                  </div>

                  {event.status === 'pending' && (
                    <div className="w-full md:w-auto flex flex-col gap-2">
                      <button
                        onClick={() => handleApprove(event.id)}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm whitespace-nowrap"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm whitespace-nowrap"
                      >
                        Reject
                      </button>
                      <button className="px-6 py-2 bg-[#3a3447] hover:bg-[#3a3447]/80 text-gray-300 rounded-lg transition-colors text-sm whitespace-nowrap">
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 mb-20">
          <div className="bg-[#1e1828] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#3a3447]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Reject Event</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-white font-semibold mb-2">Event: {selectedEvent.eventName}</p>
                <p className="text-gray-400 text-sm">By {selectedEvent.organizer}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Reason for Rejection</label>
                <textarea
                  id="rejectionReason"
                  placeholder="Explain why this event cannot be approved..."
                  rows={5}
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6] resize-none"
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-[#3a3447] flex gap-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 bg-[#3a3447] hover:bg-[#3a3447]/80 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const reason = (document.getElementById('rejectionReason') as HTMLTextAreaElement)?.value;
                  if (selectedEvent) {
                    handleReject(selectedEvent.id, reason);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
