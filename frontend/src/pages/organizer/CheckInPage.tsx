import React, { useState, useEffect } from 'react';
import { CheckInAPI } from '../../services/checkInApiService';
import { LayoutAPI } from '../../services/layoutApiService';

interface CheckInRecord {
  _id?: string;
  id?: string;
  ticketCode: string;
  customerName: string;
  customerEmail?: string;
  eventId?: string;
  eventName: string;
  zone: string;
  seatNumber: string;
  checkInTime: string | null;
  checkInBy: string;
  status: 'checked-in' | 'pending';
}

export const CheckInPage: React.FC = () => {
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTicket, setProcessingTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0
  });

  const fetchCheckInRecords = async (eventId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CheckInAPI.getRecords({
        eventId: eventId || selectedEvent || undefined,
        limit: 100
      });
      setRecords(response.data || []);
      
      // Fetch statistics
      const statsResponse = await CheckInAPI.getStatistics(eventId || selectedEvent || undefined);
      setStats(statsResponse.data);
    } catch (err: any) {
      console.error('Error fetching check-in records:', err);
      setError('Failed to fetch check-in records');
      // Fallback to mock data for demo
      setRecords([
        {
          id: '1',
          ticketCode: 'TICKET123456',
          customerName: 'Nguyen Van A',
          eventName: 'Summer Music Festival',
          zone: 'VIP',
          seatNumber: 'A1',
          checkInTime: '2024-01-29T18:30:00',
          checkInBy: 'Staff 1',
          status: 'checked-in',
        },
        {
          id: '2',
          ticketCode: 'TICKET789012',
          customerName: 'Tran Thi B',
          eventName: 'Summer Music Festival',
          zone: 'Standard',
          seatNumber: 'B5',
          checkInTime: '2024-01-29T18:45:00',
          checkInBy: 'Staff 2',
          status: 'checked-in',
        },
        {
          id: '3',
          ticketCode: 'TICKET345678',
          customerName: 'Le Van C',
          eventName: 'Summer Music Festival',
          zone: 'VIP',
          seatNumber: 'A10',
          checkInTime: null,
          checkInBy: '',
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await LayoutAPI.getMyLayouts();
      setEvents(response || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchCheckInRecords();
  }, [selectedEvent]);

  const handleScan = async (code: string) => {
    if (!code.trim()) return;

    try {
      setProcessingTicket(code);
      setError(null);
      const response = await CheckInAPI.processCheckIn(code);
      
      setSuccess(`${response.data.customerName} checked in successfully!`);
      setScanResult('');
      
      // Refresh records
      await fetchCheckInRecords();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to process check-in';
      setError(errorMsg);
      console.error('Check-in error:', err);
    } finally {
      setProcessingTicket(null);
    }
  };

  const handleManualCheckIn = async (recordId: string) => {
    const record = records.find(r => (r._id || r.id) === recordId);
    if (!record) return;

    try {
      setProcessingTicket(recordId);
      setError(null);
      
      await CheckInAPI.processCheckIn(record.ticketCode);
      setSuccess(`${record.customerName} checked in successfully!`);
      
      // Refresh records
      await fetchCheckInRecords();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to check in attendee';
      setError(errorMsg);
    } finally {
      setProcessingTicket(null);
    }
  };

  const filteredRecords = records.filter(record =>
    (!selectedEvent || record.eventName === selectedEvent) &&
    (record.ticketCode.includes(searchQuery) || 
     record.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="pb-20 pt-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
        </div>
      </div>
    );
  }

  const checkedInCount = stats.checkedIn;
  const pendingCount = stats.pending;
  const totalAttendees = stats.total;

  return (
    <div className="pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Check-In Management</h1>
            <p className="text-gray-400">Scan QR codes to check in attendees</p>
          </div>
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="px-6 py-3 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            {showScanner ? 'Hide Scanner' : 'Scan QR Code'}
          </button>
        </div>

        {/* Error & Success messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 text-green-400 rounded-lg">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#2a2436] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-2">Total Attendees</p>
            <p className="text-white font-bold text-2xl">{totalAttendees}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm mb-2">Checked In</p>
            <p className="text-green-400 font-bold text-2xl">{checkedInCount}</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm mb-2">Pending</p>
            <p className="text-yellow-400 font-bold text-2xl">{pendingCount}</p>
          </div>
        </div>

        {/* Scanner */}
        {showScanner && (
          <div className="bg-[#2a2436] rounded-xl p-6 mb-8">
            <h3 className="text-white font-bold mb-4">Scan QR Code</h3>
            <div className="bg-[#1e1828] rounded-lg p-8 text-center border-2 border-dashed border-[#3a3447] mb-4">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-2">qr_code_scanner</span>
              <p className="text-gray-400 text-sm">Place QR code in front of camera or enter code manually</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter ticket code..."
                value={scanResult}
                onChange={(e) => setScanResult(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && scanResult && !processingTicket) {
                    handleScan(scanResult);
                  }
                }}
                className="flex-1 bg-[#1e1828] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
              />
              <button
                onClick={() => {
                  if (scanResult && !processingTicket) {
                    handleScan(scanResult);
                  }
                }}
                disabled={processingTicket !== null}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {processingTicket ? 'Processing...' : 'Check In'}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by ticket code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#8655f6]"
            />
          </div>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event._id || event.id} value={event.title || event.name}>
                {event.title || event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in Records */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 bg-[#2a2436] rounded-xl">
              <span className="material-symbols-outlined text-6xl text-gray-600 mb-4 flex justify-center">person_remove</span>
              <h2 className="text-xl font-semibold text-gray-400 mb-2">No attendees found</h2>
              <p className="text-gray-500">Try selecting a different event or adjust your search</p>
            </div>
          ) : (
            filteredRecords.map(record => (
              <div
                key={record._id || record.id}
                className={`rounded-xl overflow-hidden transition-all ${record.status === 'checked-in'
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-[#2a2436]'
                }`}
              >
                <div className="p-4 gap-4 flex">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${record.status === 'checked-in' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <h3 className="text-white font-bold">{record.customerName}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mt-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Ticket Code</p>
                        <p className="text-white font-mono text-xs">{record.ticketCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Zone / Seat</p>
                        <p className="text-white font-semibold text-xs">{record.zone} / {record.seatNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Event</p>
                        <p className="text-white font-semibold text-xs">{record.eventName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className={`font-semibold text-xs ${record.status === 'checked-in' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {record.status === 'checked-in' ? '✓ Checked In' : 'Pending'}
                        </p>
                      </div>
                    </div>
                    {record.checkInTime && (
                      <p className="text-xs text-gray-500 mt-2">
                        Checked in at {new Date(record.checkInTime).toLocaleTimeString()} by {record.checkInBy}
                      </p>
                    )}
                  </div>

                  {record.status === 'pending' && (
                    <button
                      onClick={() => handleManualCheckIn(record._id || record.id || '')}
                      disabled={processingTicket !== null}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg transition-colors whitespace-nowrap h-fit"
                    >
                      {processingTicket === (record._id || record.id) ? 'Checking...' : 'Check In'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
