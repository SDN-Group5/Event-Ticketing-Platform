import React, { useState, useEffect } from 'react';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'staff' | 'checker';
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive?: string;
}

export const ManageStaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  useEffect(() => {
    // TODO: Fetch staff from API
    // const fetchStaff = async () => {
    //   try {
    //     const response = await fetch('/api/organizer/staff');
    //     const data = await response.json();
    //     setStaff(data);
    //   } catch (error) {
    //     console.error('Error fetching staff:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchStaff();

    // Mock data
    setStaff([
      {
        id: '1',
        name: 'Nguyen Van A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        role: 'checker',
        status: 'active',
        joinDate: '2024-01-15',
        lastActive: '2024-01-29',
      },
      {
        id: '2',
        name: 'Tran Thi B',
        email: 'tranthib@example.com',
        phone: '0909876543',
        role: 'staff',
        status: 'active',
        joinDate: '2024-01-20',
        lastActive: '2024-01-28',
      },
      {
        id: '3',
        name: 'Le Van C',
        email: 'levanc@example.com',
        phone: '0912345678',
        role: 'staff',
        status: 'inactive',
        joinDate: '2023-12-01',
      },
    ]);
    setLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      setStaff(staff.filter(s => s.id !== id));
      // TODO: Call API to delete staff
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingStaff(null);
    setShowModal(true);
  };

  const handleStatusChange = (id: string, newStatus: 'active' | 'inactive') => {
    setStaff(staff.map(s => s.id === id ? { ...s, status: newStatus } : s));
    // TODO: Call API to update staff status
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
          <h1 className="text-3xl font-bold text-white mb-2">Manage Staff</h1>
          <p className="text-gray-400">Add and manage event staff members</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          Add Staff
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">group</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No staff members</h2>
          <p className="text-gray-500 mb-6">Add staff members to help manage your events.</p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
          >
            Add Staff
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {staff.map(staffMember => (
            <div
              key={staffMember.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Staff Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center text-white font-bold">
                      {staffMember.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{staffMember.name}</h3>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold mt-1 ${staffMember.role === 'checker'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                        }`}>
                        <span className="material-symbols-outlined text-xs">
                          {staffMember.role === 'checker' ? 'verified' : 'person'}
                        </span>
                        {staffMember.role.charAt(0).toUpperCase() + staffMember.role.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Email</p>
                      <p className="text-white font-semibold text-xs">{staffMember.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Phone</p>
                      <p className="text-white font-semibold text-xs">{staffMember.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Joined</p>
                      <p className="text-white font-semibold text-xs">{new Date(staffMember.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {staffMember.lastActive && (
                    <p className="text-gray-500 text-xs mt-2">
                      Last active: {new Date(staffMember.lastActive).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="w-full md:w-auto flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${staffMember.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <select
                      value={staffMember.status}
                      onChange={(e) => handleStatusChange(staffMember.id, e.target.value as 'active' | 'inactive')}
                      className={`bg-transparent font-semibold text-sm focus:outline-none ${staffMember.status === 'active' ? 'text-green-400' : 'text-gray-400'
                        }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(staffMember)}
                      className="flex-1 md:flex-none px-4 py-2 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(staffMember.id)}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 mb-20">
          <div className="bg-[#1e1828] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#3a3447]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
                </h2>
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
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter staff name"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  defaultValue={editingStaff?.name}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  defaultValue={editingStaff?.email}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  defaultValue={editingStaff?.phone}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]">
                  <option value="staff">Staff</option>
                  <option value="checker">Check-in Checker</option>
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
                  // TODO: Call API to create/update staff
                }}
                className="flex-1 px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
              >
                {editingStaff ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
