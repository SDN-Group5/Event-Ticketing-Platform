import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StaffAPI } from '../../services/staffApiService';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { useToast } from '../../components/common/ToastProvider';

interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  role?: string;
}

export const StaffDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { staffId } = useParams<{ staffId: string }>();
  const { showToast } = useToast();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchStaffDetail();
  }, [staffId]);

  const fetchStaffDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      if (staffId) {
        const response = await StaffAPI.getStaffById(staffId);
        setStaff(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone || '',
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch staff details';
      setError(errorMessage);
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = async (newStatus: boolean) => {
    try {
      if (!staff) return;
      setError(null);
      await StaffAPI.updateStaff(staff._id, { isActive: newStatus });
      setSuccess(`Staff status updated to ${newStatus ? 'Active' : 'Inactive'}`);
      setStaff({ ...staff, isActive: newStatus });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update status';
      setError(errorMessage);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!staff) return;
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('First name, last name, and email are required');
        return;
      }
      setError(null);
      await StaffAPI.updateStaff(staff._id, formData);
      setSuccess('Staff member updated successfully');
      setStaff({ ...staff, ...formData });
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update staff';
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!staff) return;
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (!staff) return;
      setIsDeleting(true);
      setError(null);
      await StaffAPI.deleteStaff(staff._id);
      showToast('Staff member removed successfully', 'success');
      setTimeout(() => {
        navigate('/organizer/staff');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete staff';
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-20 pt-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="pb-20 pt-8">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <div className="text-center py-16 bg-[#2a2436] rounded-xl">
            <span className="material-symbols-outlined text-6xl text-gray-600 mb-4 flex justify-center">person_off</span>
            <h2 className="text-xl font-semibold text-gray-400 mb-2">Staff member not found</h2>
            <p className="text-gray-500 mb-6">The staff member you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/organizer/staff')}
              className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
            >
              Back to Staff List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-8">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/organizer/staff')}
            className="p-2 rounded-full bg-[#2a2436] hover:bg-[#3a3446] transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Staff Member Details</h1>
            <p className="text-gray-400">View and manage staff information</p>
          </div>
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

        {/* Main Card */}
        <div className="bg-[#2a2436] rounded-xl p-6 md:p-8 border border-[#3a3447]">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-8 border-b border-[#3a3447]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center text-white font-bold text-2xl">
              {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {staff.firstName} {staff.lastName}
              </h2>
              <p className="text-gray-400 mb-3">{staff.email}</p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${staff.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className={`text-sm font-semibold ${staff.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 text-[#8655f6] rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                {isDeleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>

          {/* Details Section */}
          {!isEditing ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">First Name</p>
                    <p className="text-white font-medium">{staff.firstName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Name</p>
                    <p className="text-white font-medium">{staff.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="text-white font-medium">{staff.email}</p>
                  </div>
                  {staff.phone && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="text-white font-medium">{staff.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#3a3447]">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Status</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(true)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          staff.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-[#1e1828] text-gray-400 border border-[#3a3447] hover:border-[#8655f6]/30'
                        }`}
                      >
                        Set Active
                      </button>
                      <button
                        onClick={() => handleStatusChange(false)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          !staff.isActive
                            ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            : 'bg-[#1e1828] text-gray-400 border border-[#3a3447] hover:border-[#8655f6]/30'
                        }`}
                      >
                        Set Inactive
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Joined On</p>
                    <p className="text-white font-medium">
                      {new Date(staff.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Edit Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      className="w-full bg-[#1e1828] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      className="w-full bg-[#1e1828] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full bg-[#1e1828] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full bg-[#1e1828] border border-[#3a3447] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8655f6]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#3a3447]">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      firstName: staff.firstName,
                      lastName: staff.lastName,
                      email: staff.email,
                      phone: staff.phone || '',
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-[#1e1828] hover:bg-[#252030] text-white rounded-lg border border-[#3a3447] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Remove Staff Member"
        message="Are you sure you want to remove this staff member? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
