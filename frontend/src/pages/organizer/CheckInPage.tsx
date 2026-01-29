import React, { useState, useEffect } from 'react';

interface CheckInRecord {
  id: string;
  ticketCode: string;
  customerName: string;
  eventName: string;
  zone: string;
  seatNumber: string;
  checkInTime: string;
  checkInBy: string;
  status: 'checked-in' | 'pending';
}

export const CheckInPage: React.FC = () => {
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: Fetch check-in records from API
    // const fetchRecords = async () => {
    //   try {
    //     const response = await fetch('/api/check-in/records');
    //     const data = await response.json();
    //     setRecords(data);
    //   } catch (error) {
    //     console.error('Error fetching records:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchRecords();

    // Mock data
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
        checkInTime: '',
        checkInBy: '',
        status: 'pending',
      },
    ]);
    setLoading(false);
  }, []);

  const handleScan = (code: string) => {
    // TODO: Process QR code and check if ticket exists
    setScanResult(code);
    // Simulate successful check-in
    const newRecord: CheckInRecord = {
      id: Math.random().toString(),
      ticketCode: code,
      customerName: 'Customer Name',
      eventName: selectedEvent || 'Event Name',
      zone: 'VIP',
      seatNumber: 'A1',
      checkInTime: new Date().toISOString(),
      checkInBy: 'Current Staff',
      status: 'checked-in',
    };
    setRecords([newRecord, ...records]);
    setScanResult('');
  };

  const filteredRecords = records.filter(record =>
    !selectedEvent || record.eventName === selectedEvent
  ).filter(record =>
    record.ticketCode.includes(searchQuery) || record.customerName.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  const checkedInCount = records.filter(r => r.status === 'checked-in').length;
  const pendingCount = records.filter(r => r.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#2a2436] rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-2">Total Attendees</p>
          <p className="text-white font-bold text-2xl">{records.length}</p>
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
              className="flex-1 bg-[#1e1828] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
            />
            <button
              onClick={() => {
                if (scanResult) {
                  handleScan(scanResult);
                }
              }}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Check In
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
          <option value="Summer Music Festival">Summer Music Festival</option>
          <option value="Tech Conference 2024">Tech Conference 2024</option>
        </select>
      </div>

      {/* Check-in Records */}
      <div className="space-y-3">
        {filteredRecords.map(record => (
          <div
            key={record.id}
            className={`rounded-xl overflow-hidden transition-all ${
              record.status === 'checked-in'
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-[#2a2436]'
            }`}
          >
            <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${record.status === 'checked-in' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <h3 className="text-white font-bold">{record.customerName}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mt-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ticket Code</p>
                    <p className="text-white font-mono">{record.ticketCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Zone / Seat</p>
                    <p className="text-white font-semibold">{record.zone} / {record.seatNumber}</p>
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
                  onClick={() => {
                    const updatedRecords = records.map(r =>
                      r.id === record.id
                        ? {
                            ...r,
                            status: 'checked-in',
                            checkInTime: new Date().toISOString(),
                            checkInBy: 'Current Staff',
                          }
                        : r
                    );
                    setRecords(updatedRecords);
                  }}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  Check In Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
