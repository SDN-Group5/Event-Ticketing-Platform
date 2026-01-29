import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Ticket {
  id: string;
  eventName: string;
  eventImage: string;
  date: string;
  location: string;
  zone: string;
  seatNumber: string;
  ticketCode: string;
  price: number;
  status: 'active' | 'used' | 'refunded' | 'cancelled';
}

export const MyTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'refunded'>('all');

  useEffect(() => {
    // TODO: Fetch tickets from API
    // const fetchTickets = async () => {
    //   try {
    //     const response = await fetch('/api/my-tickets');
    //     const data = await response.json();
    //     setTickets(data);
    //   } catch (error) {
    //     console.error('Error fetching tickets:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchTickets();

    // Mock data
    setTickets([
      {
        id: '1',
        eventName: 'Concert A',
        eventImage: 'https://via.placeholder.com/300x400',
        date: '2024-03-15',
        location: 'Ho Chi Minh City',
        zone: 'VIP',
        seatNumber: 'A1',
        ticketCode: 'TICKET123456',
        price: 500000,
        status: 'active',
      },
      {
        id: '2',
        eventName: 'Sports Event B',
        eventImage: 'https://via.placeholder.com/300x400',
        date: '2024-02-10',
        location: 'Hanoi',
        zone: 'Standard',
        seatNumber: 'B5',
        ticketCode: 'TICKET789012',
        price: 300000,
        status: 'used',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'used':
        return 'bg-blue-500/20 text-blue-400';
      case 'refunded':
        return 'bg-gray-500/20 text-gray-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'verified';
      case 'used':
        return 'check_circle';
      case 'refunded':
        return 'undo';
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

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
        <p className="text-gray-400">View and manage your event tickets</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'active', 'used', 'refunded'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:bg-[#342640]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">confirmation_number</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No tickets found</h2>
          <p className="text-gray-500 mb-6">You don't have any {filter !== 'all' ? filter : ''} tickets yet.</p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
          >
            Buy Tickets
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.01]"
            >
              <div className="flex flex-col md:flex-row">
                {/* Event Image */}
                <div className="md:w-32 h-32 flex-shrink-0">
                  <img
                    src={ticket.eventImage}
                    alt={ticket.eventName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Ticket Info */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{ticket.eventName}</h3>
                      <div className="flex flex-wrap gap-3 text-gray-400 text-sm mt-2">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {new Date(ticket.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {ticket.location}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusBadgeColor(ticket.status)}`}>
                      <span className="material-symbols-outlined text-sm">{getStatusIcon(ticket.status)}</span>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Zone</p>
                      <p className="text-white font-semibold">{ticket.zone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Seat</p>
                      <p className="text-white font-semibold">{ticket.seatNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Price</p>
                      <p className="text-white font-semibold">{ticket.price.toLocaleString()} đ</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Code</p>
                      <p className="text-white font-mono text-xs">{ticket.ticketCode}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-2 p-4 md:border-l md:border-[#3a3447]">
                  {ticket.status === 'active' && (
                    <>
                      <button className="px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg text-sm transition-colors">
                        View QR Code
                      </button>
                      <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
                        Request Refund
                      </button>
                    </>
                  )}
                  {ticket.status === 'used' && (
                    <p className="text-gray-400 text-xs text-center">Ticket already used</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
