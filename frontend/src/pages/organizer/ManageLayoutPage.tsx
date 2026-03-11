import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import { EventAPI } from '../../services/eventApiService';
import { useAuth } from '../../contexts/AuthContext';
import type { EventLayout, LayoutZone } from '../../types/layout';

export const ManageLayoutPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [layout, setLayout] = useState<EventLayout | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

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

  const handleZoneEdit = (zone: LayoutZone) => {
    setEditingZone(zone.id);
    setEditData({
      ...zone,
      seatMetadata: (zone as any).seatMetadata ? { ...(zone as any).seatMetadata } : {}
    });
  };

  const handleZoneSave = async () => {
    if (!eventId || !layout) return;

    try {
      setSaving(true);
      
      // Update the zone in the layout
      const updatedZones = layout.zones?.map(z => 
        z.id === editingZone ? editData : z
      ) || [];

      const updatedLayout = {
        ...layout,
        zones: updatedZones
      };

      await LayoutAPI.updateLayout(eventId, updatedLayout);
      setLayout(updatedLayout);
      setEditingZone(null);
      alert('Zone updated successfully');
    } catch (err: any) {
      console.error('Error updating zone:', err);
      alert('Failed to update zone');
    } finally {
      setSaving(false);
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
        <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">grid_on</span>
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
        <h1 className="text-3xl font-bold text-white mb-2">Manage Layout</h1>
        <p className="text-gray-400">{layout.eventName || 'Event Layout'}</p>
      </div>

      {/* Layout Info */}
      <div className="bg-[#2a2436] rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">info</span>
          Layout Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <p className="text-sm text-gray-500 mb-1">Event Name</p>
            <p className="font-semibold">{layout.eventName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Zones</p>
            <p className="font-semibold">{layout.zones?.length || 0} zones</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Canvas Size</p>
            <p className="font-semibold">{layout.canvasWidth}x{layout.canvasHeight}px</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Created</p>
            <p className="font-semibold">{new Date(layout.createdAt!).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Zones */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">layers</span>
          Zones ({layout.zones?.length || 0})
        </h2>

        {layout.zones && layout.zones.length > 0 ? (
          layout.zones.map((zone) => (
            <div key={zone.id} className="bg-[#2a2436] rounded-xl p-6">
              {editingZone === zone.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Edit Zone</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Zone Name</label>
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-[#3a3447] border border-[#4a4457] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8655f6]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Type</label>
                      <select
                        value={editData.type || ''}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        className="w-full px-4 py-2 bg-[#3a3447] border border-[#4a4457] rounded-lg text-white focus:outline-none focus:border-[#8655f6]"
                      >
                        <option value="seats">Seats</option>
                        <option value="standing">Standing</option>
                        <option value="stage">Stage</option>
                        <option value="exit">Exit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Price</label>
                      <input
                        type="number"
                        value={editData.price || 0}
                        onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-[#3a3447] border border-[#4a4457] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8655f6]"
                      />
                    </div>

                    {editData.rows && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Rows</label>
                        <input
                          type="number"
                          value={editData.rows || 0}
                          onChange={(e) => setEditData({ ...editData, rows: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 bg-[#3a3447] border border-[#4a4457] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#8655f6]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-[#4a4457]">
                    <button
                      onClick={handleZoneSave}
                      disabled={saving}
                      className="px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingZone(null)}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{zone.name || 'Unnamed Zone'}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-400">
                        <span className="capitalize">{zone.type}</span>
                        <span>Price: {zone.price ? `${zone.price} đ` : 'N/A'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleZoneEdit(zone)}
                      className="px-3 py-2 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg text-sm transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </button>
                  </div>

                  {(zone as any).seatMetadata && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#4a4457]">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Seats</p>
                        <p className="text-lg font-bold text-white">{(zone as any).seatMetadata.totalSeats || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Available</p>
                        <p className="text-lg font-bold text-green-400">{(zone as any).seatMetadata.availableSeats || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Sold</p>
                        <p className="text-lg font-bold text-blue-400">{(zone as any).seatMetadata.soldSeats || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Reserved</p>
                        <p className="text-lg font-bold text-yellow-400">{(zone as any).seatMetadata.reservedSeats || 0}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            No zones configured for this layout
          </div>
        )}
      </div>
    </div>
  );
};
