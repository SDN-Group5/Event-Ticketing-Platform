import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutAPI } from '../../services/layoutApiService';
import { useAuth } from '../../contexts/AuthContext';

export const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        dateStart: '',
        dateEnd: '',
        time: '',
        timeEnd: '',
        venue: '',
        description: '',
        category: 'music',
        // Bank / payout info
        payoutAccountName: '',
        payoutAccountNumber: '',
        payoutBankName: '',
        payoutBranchName: '',
        // Invoice info
        invoiceBusinessType: 'individual',
        invoiceFullName: '',
        invoiceAddress: '',
        invoiceTaxCode: '',
    });
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [bannerError, setBannerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const steps = [
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Date & Venue' },
        { num: 3, label: 'Payment Info' },
        { num: 4, label: 'Review' },
    ];

    const handleNext = async () => {
        // Chặn ở bước 1 nếu banner không đúng tỉ lệ
        if (step === 1 && bannerError) {
            return;
        }
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Submit and redirect
            setIsSubmitting(true);
            setError(null);
            try {
                // Check quyền ngay trên UI cho rõ ràng (backend cũng sẽ check)
                if (!isAuthenticated) {
                    setError('Bạn cần đăng nhập để tạo sự kiện');
                    navigate('/login');
                    return;
                }
                if (user?.role !== 'organizer' && user?.role !== 'admin') {
                    setError('Tài khoản của bạn không có quyền Organizer/Admin để tạo sự kiện');
                    navigate('/');
                    return;
                }

                // 1. Gộp ngày và giờ thành chuẩn ISO String cho startTime
                const startTimeString = formData.dateStart && formData.time
                    ? new Date(`${formData.dateStart}T${formData.time}:00`).toISOString()
                    : new Date().toISOString();

                const endTimeString = formData.dateEnd && formData.timeEnd
                    ? new Date(`${formData.dateEnd}T${formData.timeEnd}:00`).toISOString()
                    : undefined;

                // 2. Tạo MongoDB ObjectId giả định (24 hex chars)
                const generateObjectId = () => {
                    const timestamp = Math.floor(Date.now() / 1000).toString(16);
                    const randomVal = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
                        (Math.random() * 16 | 0).toString(16)
                    );
                    return (timestamp + randomVal).toLowerCase();
                };

                const realEventId = generateObjectId();

                // 3. Upload banner nếu có
                let bannerUrl: string | undefined;
                if (bannerFile) {
                    const uploaded = await LayoutAPI.uploadBanner(bannerFile);
                    bannerUrl = uploaded;
                }

                // 4. Chuẩn hóa payout / invoice info gửi lên backend
                const payoutInfo = {
                    accountName: formData.payoutAccountName || undefined,
                    accountNumber: formData.payoutAccountNumber || undefined,
                    bankName: formData.payoutBankName || undefined,
                    branchName: formData.payoutBranchName || undefined,
                };

                const invoiceInfo = {
                    businessType: formData.invoiceBusinessType || 'individual',
                    fullName: formData.invoiceFullName || undefined,
                    address: formData.invoiceAddress || undefined,
                    taxCode: formData.invoiceTaxCode || undefined,
                };

                // 5. Generate layout with empty zones array
                await LayoutAPI.createLayout({
                    eventId: realEventId,
                    eventName: formData.name,
                    eventDate: startTimeString,
                    eventImage: bannerUrl,
                    eventLocation: formData.venue,
                    eventDescription: formData.description,
                    payoutInfo,
                    invoiceInfo,
                    zones: [],
                    canvasWidth: 800,
                    canvasHeight: 600,
                    canvasColor: '#0f1219'
                });

                navigate('/organizer/events');
            } catch (err: any) {
                console.error("Failed to create event:", err);
                const errorMessage = err.response?.data?.error?.message
                    || err.response?.data?.message
                    || err.message
                    || "Failed to create event";
                setError(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate('/organizer');
    };

    return (
        <div>
            <div className="max-w-4xl mx-auto pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/organizer')}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white">Create New Event</h1>
                        <p className="text-slate-400">Fill in the details to create your event</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-10">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center">
                            <div className={`flex items-center gap-3 ${step >= s.num ? 'text-white' : 'text-slate-500'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step > s.num ? 'bg-emerald-500' :
                                    step === s.num ? 'bg-gradient-to-r from-[#8655f6] to-[#d946ef]' :
                                        'bg-slate-700'
                                    }`}>
                                    {step > s.num ? (
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    ) : s.num}
                                </div>
                                <span className="text-sm font-medium hidden md:block">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-12 md:w-24 h-1 mx-2 md:mx-4 rounded ${step > s.num ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-[#1e293b]/60 backdrop-blur border border-white/5 rounded-2xl p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Event Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6] focus:ring-2 focus:ring-[#8655f6]/20"
                                    placeholder="Enter event name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                >
                                    <option value="music">Music & Concerts</option>
                                    <option value="sports">Sports</option>
                                    <option value="arts">Arts & Theater</option>
                                    <option value="food">Food & Drink</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6] min-h-[120px]"
                                    placeholder="Describe your event..."
                                />
                            </div>

                            {/* Banner upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Event Banner</label>
                                <div className="flex flex-col md:flex-row gap-4 items-start">
                                    <label className="inline-flex items-center px-4 py-2 rounded-xl bg-[#0f172a] border border-dashed border-slate-600 text-slate-300 cursor-pointer hover:border-[#8655f6] hover:text-white transition-colors">
                                        <span className="material-symbols-outlined mr-2">upload</span>
                                        <span>Upload image from your device</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) {
                                                    setBannerFile(null);
                                                    setBannerPreview(null);
                                                    setBannerError(null);
                                                    return;
                                                }

                                                // Kiểm tra tỉ lệ ảnh 2:1 (1200x600)
                                                const objectUrl = URL.createObjectURL(file);
                                                const img = new Image();
                                                img.onload = () => {
                                                    const { naturalWidth: w, naturalHeight: h } = img;
                                                    // Kiểm tra tỉ lệ 2:1 (cho phép sai số nhỏ < 1%)
                                                    const ratio = w / h;
                                                    const expectedRatio = 2;
                                                    const tolerance = 0.02; // 2%
                                                    if (Math.abs(ratio - expectedRatio) > tolerance) {
                                                        setBannerError(
                                                            `Ảnh không đúng tỉ lệ 2:1. Kích thước ảnh của bạn: ${w}x${h}px (tỉ lệ ${ratio.toFixed(2)}:1). Vui lòng dùng ảnh 1200x600px hoặc tỉ lệ tương đương.`
                                                        );
                                                        setBannerFile(null);
                                                        setBannerPreview(null);
                                                        URL.revokeObjectURL(objectUrl);
                                                        // Reset input để có thể chọn lại
                                                        e.target.value = '';
                                                    } else {
                                                        setBannerError(null);
                                                        setBannerFile(file);
                                                        setBannerPreview(objectUrl);
                                                    }
                                                };
                                                img.onerror = () => {
                                                    setBannerError('Không thể đọc ảnh. Vui lòng chọn file ảnh hợp lệ.');
                                                    setBannerFile(null);
                                                    setBannerPreview(null);
                                                    URL.revokeObjectURL(objectUrl);
                                                    e.target.value = '';
                                                };
                                                img.src = objectUrl;
                                            }}
                                        />
                                    </label>

                                    {bannerPreview && (
                                        <div className="w-full md:w-48 rounded-xl overflow-hidden border border-slate-700 bg-[#0f172a]">
                                            <img
                                                src={bannerPreview}
                                                alt="Event banner preview"
                                                className="w-full h-32 object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                                {bannerError && (
                                    <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                                        <span className="material-symbols-outlined text-red-400 text-lg flex-shrink-0 mt-0.5">error</span>
                                        <p className="text-sm text-red-400">{bannerError}</p>
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-slate-500">
                                    Bắt buộc tỉ lệ 2:1 (ví dụ: 1200x600px), tối đa 5MB. Định dạng: JPG, PNG.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Date Start</label>
                                    <input
                                        type="date"
                                        value={formData.dateStart}
                                        onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Time Start</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Date End</label>
                                    <input
                                        type="date"
                                        value={formData.dateEnd}
                                        onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Time End</label>
                                    <input
                                        type="time"
                                        value={formData.timeEnd}
                                        onChange={(e) => setFormData({ ...formData, timeEnd: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Venue *</label>
                                <input
                                    type="text"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    placeholder="Enter venue name or address"
                                />
                            </div>
                            <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700">
                                <p className="text-sm text-slate-400 mb-3">Or select from popular venues:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Grand Arena', 'City Hall', 'Riverside Park', 'Convention Center'].map(venue => (
                                        <button
                                            key={venue}
                                            onClick={() => setFormData({ ...formData, venue })}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.venue === venue
                                                ? 'bg-[#8655f6] text-white'
                                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                        >
                                            {venue}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Payment & Invoice Information</h3>

                            {/* Bank info */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Bank Account for Payout</h4>
                                <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Account Holder Name</label>
                                        <input
                                            type="text"
                                            value={formData.payoutAccountName}
                                            onChange={(e) => setFormData({ ...formData, payoutAccountName: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                            placeholder="Tên chủ tài khoản"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">Account Number</label>
                                            <input
                                                type="text"
                                                value={formData.payoutAccountNumber}
                                                onChange={(e) => setFormData({ ...formData, payoutAccountNumber: e.target.value })}
                                                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                                placeholder="Số tài khoản"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">Bank Name</label>
                                            <input
                                                type="text"
                                                value={formData.payoutBankName}
                                                onChange={(e) => setFormData({ ...formData, payoutBankName: e.target.value })}
                                                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                                placeholder="Tên ngân hàng"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Branch</label>
                                        <input
                                            type="text"
                                            value={formData.payoutBranchName}
                                            onChange={(e) => setFormData({ ...formData, payoutBranchName: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                            placeholder="Chi nhánh"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Invoice info */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Invoice Information</h4>
                                <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Business Type</label>
                                        <select
                                            value={formData.invoiceBusinessType}
                                            onChange={(e) => setFormData({ ...formData, invoiceBusinessType: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="company">Company</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Full Name / Company Name</label>
                                        <input
                                            type="text"
                                            value={formData.invoiceFullName}
                                            onChange={(e) => setFormData({ ...formData, invoiceFullName: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                            placeholder="Tên đầy đủ / Tên công ty"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Address</label>
                                        <input
                                            type="text"
                                            value={formData.invoiceAddress}
                                            onChange={(e) => setFormData({ ...formData, invoiceAddress: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                            placeholder="Địa chỉ xuất hóa đơn"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Tax Code</label>
                                        <input
                                            type="text"
                                            value={formData.invoiceTaxCode}
                                            onChange={(e) => setFormData({ ...formData, invoiceTaxCode: e.target.value })}
                                            className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                            placeholder="Mã số thuế (nếu có)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Review Your Event</h3>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-red-400">error</span>
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Basic Info Summary */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Basic Information</h4>
                                <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Event Name</span>
                                        <span className="font-bold text-white">{formData.name || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Category</span>
                                        <span className="font-medium text-white capitalize">{formData.category}</span>
                                    </div>
                                    {formData.description && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Description</span>
                                            <span className="font-medium text-white">{formData.description.substring(0, 40) + (formData.description.length > 40 ? '...' : '')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date & Venue Summary */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-400 mb-3">Date & Venue</h4>
                                <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Start</span>
                                        <span className="font-medium text-white">{formData.dateStart || 'Not set'} at {formData.time || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">End</span>
                                        <span className="font-medium text-white">{formData.dateEnd || 'Not set'} at {formData.timeEnd || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Venue</span>
                                        <span className="font-medium text-white">{formData.venue || 'Not set'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Date & Venue Summary End */}

                            {/* Banner summary */}
                            {bannerPreview && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-3">Event Banner</h4>
                                    <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-700">
                                        <img
                                            src={bannerPreview}
                                            alt="Event banner preview"
                                            className="w-full max-h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {!error && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                                    <p className="text-sm text-emerald-400">Your event is ready to be published!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
                        <button
                            onClick={handleBack}
                            disabled={isSubmitting}
                            className="px-6 py-3 border border-slate-600 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isSubmitting || (step === 1 && !!bannerError)}
                            className="px-8 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-xl font-bold text-white shadow-lg shadow-[#8655f6]/30 hover:shadow-[#8655f6]/50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {step === 4 ? (
                                <>
                                    {isSubmitting ? (
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined">publish</span>
                                    )}
                                    {isSubmitting ? 'Publishing...' : 'Publish Event'}
                                </>
                            ) : (
                                <>
                                    Continue
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};