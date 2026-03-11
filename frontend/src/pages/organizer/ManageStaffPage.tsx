import React, { useState, useEffect } from 'react';
import { StaffAPI } from '../../services/staffApiService';

interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export const ManageStaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchStaff = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaffAPI.getStaffList({
        page: pageNum,
        limit: 10,
        isActive: filter === 'all' ? undefined : filter === 'active'
      });

      setStaff(response.data || []);
      setTotal(response.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch staff';
      setError(errorMessage);
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(1);
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await StaffAPI.deleteStaff(id);
        setSuccess('Staff member removed successfully');
        fetchStaff(page);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to delete staff';
        setError(errorMessage);
      }
    }
  };

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      phone: staffMember.phone || '',
      password: '',
    });
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingStaff(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    });
    setShowModal(true);
  };

  const handleStatusChange = async (id: string, newStatus: boolean) => {
    try {
      await StaffAPI.updateStaff(id, { isActive: newStatus });
      setSuccess('Staff status updated successfully');
      fetchStaff(page);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update status';
      setError(errorMessage);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('First name, last name, and email are required');
      return;
    }

    if (!editingStaff && !formData.password) {
      setError('Password is required for new staff');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingStaff) {
        // Update existing staff
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        };
        await StaffAPI.updateStaff(editingStaff._id, updateData);
        setSuccess('Staff member updated successfully');
      } else {
        // Create new staff
        if (!formData.password) {
          setError('Password is required');
          return;
        }
        await StaffAPI.createStaff({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
        setSuccess('Staff member created successfully');
      }

      setShowModal(false);
      fetchStaff(page);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to save staff';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && staff.length === 0) {
    return (
      <div className="pb-20 pt-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
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

        {/* Messages */}
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

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'active'
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'inactive'
                ? 'bg-[#8655f6] text-white'
                : 'bg-[#2a2436] text-gray-400 hover:text-white'
            }`}
          >
            Inactive
          </button>
        </div>

        {staff.length === 0 ? (
          <div className="text-center py-16 bg-[#2a2436] rounded-xl">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4 flex justify-center">group</span>
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
          <>
            <div className="space-y-4 mb-8">
              {staff.map(staffMember => (
                <div
                  key={staffMember._id}
                  className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Staff Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center text-white font-bold">
                          {staffMember.firstName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-bold">
                            {staffMember.firstName} {staffMember.lastName}
                          </h3>
                          <p className="text-gray-400 text-sm">{staffMember.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Email</p>
                          <p className="text-white font-semibold text-xs">{staffMember.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Phone</p>
                          <p className="text-white font-semibold text-xs">{staffMember.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Joined</p>
                          <p className="text-white font-semibold text-xs">
                            {new Date(staffMember.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="w-full md:w-auto flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            staffMember.isActive ? 'bg-green-400' : 'bg-gray-400'
                          }`}
                        ></div>
                        <select
                          value={staffMember.isActive ? 'active' : 'inactive'}
                          onChange={(e) =>
                            handleStatusChange(staffMember._id, e.target.value === 'active')
                          }
                          className={`bg-transparent font-semibold text-sm focus:outline-none cursor-pointer ${
                            staffMember.isActive ? 'text-green-400' : 'text-gray-400'
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
                          onClick={() => handleDelete(staffMember._id)}
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

            {/* Pagination */}
            {total > 10 && (
              <div className="flex justify-center gap-2 mb-8">
                <button
                  onClick={() => fetchStaff(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#2a2436] hover:bg-[#3a3446] disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <button
                  onClick={() => fetchStaff(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="px-4 py-2 bg-[#2a2436] hover:bg-[#3a3446] disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Staff Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#1e1828] rounded-xl w-full max-w-md">
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

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                  />
                </div>

                {!editingStaff && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter password (min 6 characters)"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full bg-[#2a2436] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                      required
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-[#2a2436] hover:bg-[#3a3446] text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                  >
                    {isSubmitting ? 'Saving...' : editingStaff ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};