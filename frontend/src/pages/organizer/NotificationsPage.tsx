import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'payment' | 'ticket' | 'staff' | 'system';
  recipient: 'all' | 'customers' | 'staff';
  status: 'draft' | 'scheduled' | 'sent';
  sendDate?: string;
  createdDate: string;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // TODO: Fetch notifications from API
    // const fetchNotifications = async () => {
    //   try {
    //     const response = await fetch('/api/organizer/notifications');
    //     const data = await response.json();
    //     setNotifications(data);
    //   } catch (error) {
    //     console.error('Error fetching notifications:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchNotifications();

    // Mock data
    setNotifications([
      {
        id: '1',
        title: 'Event Reminder',
        message: 'Summer Music Festival starts tomorrow at 6 PM',
        type: 'event',
        recipient: 'customers',
        status: 'sent',
        sendDate: '2024-01-29',
        createdDate: '2024-01-29',
      },
      {
        id: '2',
        title: 'Staff Assignment',
        message: 'Please check your shift schedule for tomorrow',
        type: 'staff',
        recipient: 'staff',
        status: 'scheduled',
        sendDate: '2024-01-30',
        createdDate: '2024-01-28',
      },
      {
        id: '3',
        title: 'New Ticket Sales Alert',
        message: 'You have sold 50 more tickets in the last hour',
        type: 'ticket',
        recipient: 'all',
        status: 'draft',
        createdDate: '2024-01-28',
      },
    ]);
    setLoading(false);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-500/20 text-blue-400';
      case 'payment':
        return 'bg-green-500/20 text-green-400';
      case 'ticket':
        return 'bg-purple-500/20 text-purple-400';
      case 'staff':
        return 'bg-orange-500/20 text-orange-400';
      case 'system':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return 'event';
      case 'payment':
        return 'payments';
      case 'ticket':
        return 'confirmation_number';
      case 'staff':
        return 'group';
      case 'system':
        return 'notifications';
      default:
        return 'info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400';
      case 'scheduled':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'sent':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">Send updates to your customers and staff</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Send Notification
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">notifications</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h2>
          <p className="text-gray-500 mb-6">Create your first notification to communicate with customers and staff.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
          >
            Send Notification
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(notification.type)}`}>
                      <span className="material-symbols-outlined text-sm">{getTypeIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{notification.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(notification.status)}`}>
                      {notification.status}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400 pl-13">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">group</span>
                    Sent to: <span className="text-white font-semibold">{notification.recipient.charAt(0).toUpperCase() + notification.recipient.slice(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    Created: <span className="text-white font-semibold">{new Date(notification.createdDate).toLocaleDateString()}</span>
                  </div>
                  {notification.sendDate && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule_send</span>
                      Sent: <span className="text-white font-semibold">{new Date(notification.sendDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {notification.status === 'draft' && (
                  <div className="flex gap-2 mt-4 pl-13">
                    <button className="px-4 py-2 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg text-sm transition-colors">
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors">
                      Send Now
                    </button>
                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 mb-20">
          <div className="bg-[#1e1828] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#3a3447]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Send Notification</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Notification title"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Message</label>
                <textarea
                  placeholder="Notification message"
                  rows={4}
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6] resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]">
                  <option value="event">Event</option>
                  <option value="ticket">Ticket</option>
                  <option value="staff">Staff</option>
                  <option value="payment">Payment</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Send to</label>
                <select className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]">
                  <option value="all">Everyone</option>
                  <option value="customers">Customers Only</option>
                  <option value="staff">Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Send Time</label>
                <select className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]">
                  <option value="now">Send Now</option>
                  <option value="schedule">Schedule Later</option>
                  <option value="draft">Save as Draft</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-[#3a3447] flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-[#3a3447] hover:bg-[#3a3447]/80 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  // TODO: Call API to send notification
                }}
                className="flex-1 px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
