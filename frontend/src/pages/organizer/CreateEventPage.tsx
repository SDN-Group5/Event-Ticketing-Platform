import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateEventBanner, generateEventDescription } from '../../services/aiContentService';

export const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        venue: '',
        description: '',
        category: 'music',
        bannerUrl: '',
        bannerPrompt: '',
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const steps = [
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Content & Media' },
        { num: 3, label: 'Date & Venue' },
        { num: 4, label: 'Tickets' },
        { num: 5, label: 'Review' },
    ];

const handleNext = () => {
        if (step < 5) setStep(step + 1);
        else {
            // Submit and redirect
            navigate('/organizer');
        }
    };

    const handleGenerateBanner = async () => {
        if (!formData.bannerPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateEventBanner({
                prompt: formData.bannerPrompt,
                eventName: formData.name || undefined,
            });
            setFormData({ ...formData, bannerUrl: result.imageDataUrl });
            console.log(`✅ Banner đã được tạo bằng provider: ${result.provider}`);
        } catch (error) {
            console.error('Generation error:', error);
            const msg = error instanceof Error ? error.message : 'Lỗi khi tạo banner.';
            alert(msg + '\n\n💡 Vui lòng upload ảnh thủ công hoặc xem doc/IMAGE_GENERATION_SETUP.md để setup provider.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setUploadedImage(result);
                setFormData({ ...formData, bannerUrl: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateDescription = async () => {
        if (!formData.name.trim()) {
            alert('Vui lòng nhập tên sự kiện trước.');
            return;
        }
        setIsGeneratingDesc(true);
        try {
            const text = await generateEventDescription({
                eventName: formData.name,
                category: formData.category,
            });
            setFormData({ ...formData, description: text });
        } catch (error) {
            console.error('Description generation error:', error);
            const msg = error instanceof Error ? error.message : 'Lỗi khi tạo mô tả.';
            alert(msg + ' Kiểm tra GROQ_API_KEY trong .env');
        } finally {
            setIsGeneratingDesc(false);
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
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-6">Content & Media Generation</h3>
                            
                            {/* AI Banner Generator */}
                            <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#8655f6]">auto_awesome</span>
                                    <h4 className="font-bold text-white">AI Banner Generator</h4>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">Mô tả sự kiện để AI tạo banner cho bạn</p>
                                
                                <div className="space-y-4">
                                    <textarea
                                        value={formData.bannerPrompt}
                                        onChange={(e) => setFormData({ ...formData, bannerPrompt: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm min-h-[80px] focus:border-[#8655f6]"
                                        placeholder="VD: Electronic music festival with neon lights, DJ on stage, energetic crowd..."
                                    />
                                    <button
                                        onClick={handleGenerateBanner}
                                        disabled={isGenerating || !formData.bannerPrompt.trim()}
                                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">auto_awesome</span>
                                                Generate Banner
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Upload Image */}
                            <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#8655f6]">upload_file</span>
                                    <h4 className="font-bold text-white">Hoặc Upload Ảnh</h4>
                                </div>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-[#8655f6] transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <span className="material-symbols-outlined text-3xl text-slate-500 mb-2">cloud_upload</span>
                                        <p className="text-sm text-slate-400">Click để upload hoặc kéo thả file</p>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG (max 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>

                            {/* Banner Preview */}
                            {formData.bannerUrl && (
                                <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-700">
                                    <h4 className="font-bold text-white mb-4">Preview</h4>
                                    <div className="relative rounded-lg overflow-hidden aspect-[2/1] bg-slate-800">
                                        <img 
                                            src={formData.bannerUrl} 
                                            alt="Event banner preview" 
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => setFormData({ ...formData, bannerUrl: '' })}
                                            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-white text-sm">close</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Poster Templates */}
                            <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#8655f6]">image</span>
                                    <h4 className="font-bold text-white">Poster Templates</h4>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">Chọn template và tùy chỉnh cho poster sự kiện</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: 1, name: 'Minimalist', color: 'from-slate-700 to-slate-900' },
                                        { id: 2, name: 'Vibrant', color: 'from-purple-600 to-pink-600' },
                                        { id: 3, name: 'Neon', color: 'from-cyan-500 to-blue-600' },
                                        { id: 4, name: 'Gradient', color: 'from-orange-500 to-red-600' },
                                        { id: 5, name: 'Dark', color: 'from-gray-900 to-black' },
                                        { id: 6, name: 'Retro', color: 'from-yellow-500 to-orange-500' },
                                    ].map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => {
                                                const posterUrl = `https://picsum.photos/seed/template${template.id}/600/900`;
                                                setFormData({ ...formData, bannerUrl: posterUrl });
                                            }}
                                            className="relative aspect-[2/3] rounded-lg overflow-hidden group"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{template.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Auto Description */}
                            <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#8655f6]">description</span>
                                        <h4 className="font-bold text-white">Mô Tả Sự Kiện</h4>
                                    </div>
                                    <button
                                        onClick={handleGenerateDescription}
                                        disabled={isGeneratingDesc || !formData.name.trim()}
                                        className="px-4 py-2 bg-[#8655f6]/20 hover:bg-[#8655f6]/30 disabled:opacity-50 rounded-lg text-[#8655f6] text-sm font-medium transition-colors flex items-center gap-1"
                                    >
                                        {isGeneratingDesc ? (
                                            <>
                                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                                                Auto Generate
                                            </>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm min-h-[100px] focus:border-[#8655f6]"
                                    placeholder="Nhập mô tả sự kiện hoặc click Auto Generate..."
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#8655f6]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Time *</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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

                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Ticket Types</h3>
                            {['General Admission', 'VIP Access', 'Backstage Pass'].map((type, i) => (
                                <div key={type} className="bg-[#0f172a] border border-slate-700 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-bold text-white">{type}</span>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" defaultChecked={i < 2} className="rounded border-slate-600" />
                                            <span className="text-sm text-slate-400">Enable</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Price ($)</label>
                                            <input
                                                type="number"
                                                defaultValue={[45, 120, 250][i]}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                defaultValue={[500, 100, 20][i]}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white mb-4">Review Your Event</h3>
                            <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-700">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Event Name</span>
                                        <span className="font-bold text-white">{formData.name || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Category</span>
                                        <span className="font-medium text-white capitalize">{formData.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Date & Time</span>
                                        <span className="font-medium text-white">{formData.date || 'Not set'} at {formData.time || 'Not set'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Venue</span>
                                        <span className="font-medium text-white">{formData.venue || 'Not set'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                                <p className="text-sm text-emerald-400">Your event is ready to be published!</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 border border-slate-600 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-gradient-to-r from-[#8655f6] to-[#d946ef] rounded-xl font-bold text-white shadow-lg shadow-[#8655f6]/30 hover:shadow-[#8655f6]/50 transition-all flex items-center gap-2"
                        >
                            {step === 5 ? (
                                <>
                                    <span className="material-symbols-outlined">publish</span>
                                    Publish Event
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
