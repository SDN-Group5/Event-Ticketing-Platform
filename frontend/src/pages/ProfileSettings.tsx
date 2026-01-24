import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import * as apiClient from "../api-client";
import { useUserStore } from "../stores/userStore";
import useAppContext from "../hooks/useAppContext";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner";
import TicketVibeNavbar from "../components/common/TicketVibeNavbar";
import { useMutationWithLoading } from "../hooks/useLoadingHooks";

const profileSettingsSchema = z.object({
    fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    phone: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().max(500, "Bio không được vượt quá 500 ký tự").optional(),
});

type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

const ProfileSettings = () => {
    const { currentUser, setCurrentUser } = useUserStore();
    const { showToast } = useAppContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Fetch user info
    const { data: user, isLoading } = useQuery({
        queryKey: ["fetchCurrentUser"],
        queryFn: async () => {
            const userData = await apiClient.fetchCurrentUser();
            setCurrentUser(userData);
            return userData;
        },
        retry: false,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<ProfileSettingsFormData>({
        resolver: zodResolver(profileSettingsSchema),
        defaultValues: {
            fullName: user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : currentUser?.firstName && currentUser?.lastName
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : "",
            phone: user?.phone || currentUser?.phone || "",
            location: user?.address?.city && user?.address?.country
                ? `${user.address.city}, ${user.address.country}`
                : currentUser?.address?.city && currentUser?.address?.country
                    ? `${currentUser.address.city}, ${currentUser.address.country}`
                    : "",
            bio: "", // Bio field - not in backend yet, but ready for future
        },
    });

    const bioValue = watch("bio") || "";
    const bioCharCount = bioValue.length;

    // Update form khi user data load xong
    useEffect(() => {
        if (user || currentUser) {
            const data = user || currentUser;
            reset({
                fullName: data?.firstName && data?.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : "",
                phone: data?.phone || "",
                location: data?.address?.city && data?.address?.country
                    ? `${data.address.city}, ${data.address.country}`
                    : "",
                bio: "", // Bio field - not in backend yet
            });
        }
    }, [user, currentUser, reset]);

    // Upload avatar mutation
    const uploadAvatarMutation = useMutationWithLoading(
        async (file: File) => {
            return await apiClient.uploadAvatar(file);
        },
        {
            onSuccess: async (response) => {
                if (response.user) {
                    setCurrentUser(response.user);
                }
                setAvatarPreview(null); // Clear preview after successful upload
                showToast({
                    title: "Thành công",
                    description: "Đã cập nhật avatar thành công.",
                    type: "SUCCESS",
                });
                await queryClient.invalidateQueries({ queryKey: ["fetchCurrentUser"] });
            },
            onError: (error: Error) => {
                showToast({
                    title: "Lỗi",
                    description: error.message || "Không thể upload avatar.",
                    type: "ERROR",
                });
            },
            loadingMessage: "Đang upload avatar...",
        }
    );

    const updateProfileMutation = useMutationWithLoading(
        async (data: ProfileSettingsFormData) => {
            // Convert fullName to firstName and lastName
            const nameParts = data.fullName.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Convert location to address.city and address.country
            const locationParts = data.location?.split(",").map(s => s.trim()) || [];
            const city = locationParts[0] || "";
            const country = locationParts[1] || "";

            return await apiClient.updateProfile({
                firstName,
                lastName,
                phone: data.phone,
                address: {
                    city,
                    country,
                },
            });
        },
        {
            onSuccess: async (response) => {
                // Update user store với data mới
                if (response.user) {
                    setCurrentUser(response.user);
                }
                showToast({
                    title: "Thành công",
                    description: "Đã cập nhật thông tin profile thành công.",
                    type: "SUCCESS",
                });
                await queryClient.invalidateQueries({ queryKey: ["fetchCurrentUser"] });
                navigate("/profile");
            },
            onError: (error: Error) => {
                showToast({
                    title: "Lỗi",
                    description: error.message || "Không thể cập nhật profile.",
                    type: "ERROR",
                });
            },
            loadingMessage: "Đang cập nhật...",
        }
    );

    const onSubmit = handleSubmit((data) => {
        updateProfileMutation.mutate(data);
    });

    // Handle avatar file selection
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            showToast({
                title: "Lỗi",
                description: "Chỉ chấp nhận file ảnh.",
                type: "ERROR",
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast({
                title: "Lỗi",
                description: "Kích thước file không được vượt quá 5MB.",
                type: "ERROR",
            });
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload immediately
        uploadAvatarMutation.mutate(file);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-dark">
                <TicketVibeNavbar />
                <LoadingSpinner message="Đang tải thông tin..." />
            </div>
        );
    }

    const displayUser = user || currentUser;
    const fullName = displayUser?.firstName && displayUser?.lastName
        ? `${displayUser.firstName} ${displayUser.lastName}`
        : displayUser?.email || "User";

    return (
        <div className="min-h-screen bg-background-dark">
            <TicketVibeNavbar />

            <main className="max-w-[1280px] mx-auto flex flex-col md:flex-row gap-6 p-4 md:p-6">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-[240px] flex flex-col gap-[24px]">
                    <div className="glass-card rounded-xl p-[16px] flex flex-col gap-[4px]">
                        <div className="px-[12px] py-[16px] flex items-center gap-[12px] mb-[8px]">
                            <div className="w-[48px] h-[48px] rounded-full overflow-hidden shrink-0">
                                {displayUser?.avatar ? (
                                    <img
                                        src={displayUser.avatar}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary to-[#a881ff] flex items-center justify-center">
                                        <span className="text-white text-[18px] font-bold leading-[48px]">
                                            {displayUser?.firstName?.[0]?.toUpperCase() || displayUser?.email?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-white text-[14px] leading-[20px] truncate">{fullName}</p>
                                <p className="text-[12px] leading-[16px] text-slate-400 truncate capitalize">
                                    {displayUser?.role || "User"}
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/profile/settings"
                            className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-lg bg-primary text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">person</span>
                            <span className="text-[14px] leading-[20px] font-medium">Personal Info</span>
                        </Link>
                        <Link
                            to="/profile/security"
                            className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">shield</span>
                            <span className="text-[14px] leading-[20px] font-medium">Security</span>
                        </Link>
                        <Link
                            to="/profile/notifications"
                            className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            <span className="text-[14px] leading-[20px] font-medium">Notifications</span>
                        </Link>
                        <Link
                            to="/profile/payments"
                            className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                            <span className="text-[14px] leading-[20px] font-medium">Payments</span>
                        </Link>
                        <Link
                            to="/customer/tickets"
                            className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                            <span className="text-[14px] leading-[20px] font-medium">Ticket History</span>
                        </Link>
                    </div>

                    <div className="glass-card rounded-xl p-[24px]">
                        <p className="text-[12px] leading-[16px] font-bold text-slate-500 uppercase tracking-widest mb-[16px]">
                            Account Status
                        </p>
                        <div className="flex items-center gap-[8px] mb-[8px]">
                            <span className="w-[8px] h-[8px] rounded-full ${displayUser?.emailVerified ? 'bg-emerald-500' : 'bg-yellow-500'}"></span>
                            <span className="text-[14px] leading-[20px] text-slate-300">
                                {displayUser?.emailVerified ? "Verified Account" : "Unverified Account"}
                            </span>
                        </div>
                        <p className="text-[12px] leading-[16px] text-slate-500">
                            Member since {displayUser?.createdAt
                                ? new Date(displayUser.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                })
                                : "Recently"}
                        </p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <section className="flex-1 flex flex-col gap-8">
                    {/* Hero Header */}
                    <div className="relative">
                        <div className="h-[192px] w-full rounded-xl overflow-hidden relative group">
                            <img
                                className="w-full h-full object-cover object-center"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMWjxDuNJ5rE2YMjIOda61yyPY8s-xPRw_H5rXqLWUfEkxeNWN2fqdNfoqUJv6sf3HwV6fC766qKxfi1YyJ0eG-BqTEHPyUBRdo_AqiLZjMUP5v1nAGhvRCAegAVvjpqn4YFI1QlpyazDF3_FOmUreBhqWYxky4SbXbBKT_GvDdGIUgd7LtjZRNE-eAgOo8lhwZQqFPuF88bUmgdgJh2yVuQZY5QJdmS-r9LbNNNLXNON2QzeYuTxgGP_-yCAKrZogibzz5n7aWfQ"
                                alt="Concert stage with purple lights"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-0">
                                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/20">
                                    <span className="material-symbols-outlined text-white">add_a_photo</span>
                                    <span className="text-white text-sm font-medium">Change Cover</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-[48px] left-[32px] flex items-end gap-6 z-30">
                            <div
                                className="w-[128px] h-[128px] rounded-full border-[4px] border-background-dark overflow-hidden relative group shadow-2xl cursor-pointer hover:border-primary/50 transition-all z-40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAvatarClick();
                                }}
                                title="Click để thay đổi avatar"
                            >
                                {avatarPreview || displayUser?.avatar ? (
                                    <img
                                        src={avatarPreview || displayUser?.avatar}
                                        alt={fullName}
                                        className="w-full h-full object-cover object-center"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary to-[#a881ff] flex items-center justify-center">
                                        <span className="text-white text-5xl font-bold pointer-events-none">
                                            {displayUser?.firstName?.[0]?.toUpperCase() || displayUser?.email?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white text-2xl">
                                        {uploadAvatarMutation.isPending ? "hourglass_empty" : "edit"}
                                    </span>
                                </div>
                                {uploadAvatarMutation.isPending && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-none">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                                <p className="text-slate-400 text-sm">Update your personal information and profile visibility</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Sections */}
                    <form onSubmit={onSubmit} className="mt-12 flex flex-col gap-6">
                        {/* Personal Information */}
                        <div className="glass-card rounded-xl p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="material-symbols-outlined text-primary">badge</span>
                                <h3 className="text-lg font-bold text-white">Account Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Full Name</label>
                                    <input
                                        {...register("fullName")}
                                        className="bg-white/5 border-white/10 rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. John Doe"
                                        type="text"
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-400 text-xs">{errors.fullName.message}</p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Email Address</label>
                                    <input
                                        className="bg-white/5 border-white/10 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed outline-none"
                                        readOnly
                                        type="email"
                                        value={displayUser?.email || ""}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Location</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
                                            location_on
                                        </span>
                                        <input
                                            {...register("location")}
                                            className="w-full bg-white/5 border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                            placeholder="City, Country"
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Username</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-white/10 bg-white/10 text-slate-400 text-sm">
                                            ticketvibe.com/
                                        </span>
                                        <input
                                            className="flex-1 min-w-0 bg-white/5 border-white/10 rounded-r-lg px-4 py-3 text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                            placeholder="username"
                                            type="text"
                                            disabled
                                            value={displayUser?.email?.split("@")[0] || ""}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">Username cannot be changed</p>
                                </div>
                            </div>
                        </div>

                        {/* Biography Section */}
                        <div className="glass-card rounded-xl p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">description</span>
                                    <h3 className="text-lg font-bold text-white">About Me</h3>
                                </div>
                                <span className="text-xs text-slate-500 font-medium">{bioCharCount}/500 characters</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-400">Bio</label>
                                <textarea
                                    {...register("bio")}
                                    className="bg-white/5 border-white/10 rounded-lg px-4 py-3 text-white focus:ring-primary focus:border-primary outline-none transition-all resize-none placeholder:text-slate-600"
                                    placeholder="Tell us about your event interests, favorite music genres, or festivals you've attended..."
                                    rows={4}
                                />
                                {errors.bio && (
                                    <p className="text-red-400 text-xs">{errors.bio.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 pb-12">
                            <div className="order-2 md:order-1">
                                <button
                                    type="button"
                                    className="text-rose-500 hover:text-rose-400 text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">no_accounts</span>
                                    Deactivate Account
                                </button>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto order-1 md:order-2">
                                <button
                                    type="button"
                                    onClick={() => navigate("/profile")}
                                    className="flex-1 md:flex-none px-8 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateProfileMutation.isPending}
                                    className="flex-1 md:flex-none px-10 py-3 rounded-xl bg-gradient-to-r from-primary to-[#a882ff] text-white font-bold shadow-[0_0_20px_rgba(134,85,246,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </main>

            {/* Map Context Footer */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 pb-20">
                <div className="w-full h-[160px] rounded-xl overflow-hidden glass-card relative">
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                    <img
                        className="w-full h-full object-cover object-center opacity-30 grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyk6Kgg3ed3tMG6oA-cRrP-VdAAN4GPioBWiV-WsyfPY4A9JI4wnNpPbAxlllyYS1M6AkHNWf6s_NJt54Kq5ljvdFoaavA0x0sU6o7ek40giENOYIgplrJ2B6ebO3QgBOT5nw8fNZ0t3qOOrW89s9YorgeADbfd5s3hbDcyeP2mJO_58N31djclqyyrC-LawVAxVhtS93nzpYsR2FQj7g7O2HaCfXFT9vKDOUJ8vvtTuL_JbhPlLl7k4Qw2oh5Bu92_jgYs6jB3T0"
                        alt="Map location"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary fill-1">location_on</span>
                            <span className="text-sm font-bold text-white">
                                Your current event region: {displayUser?.address?.city && displayUser?.address?.country
                                    ? `${displayUser.address.city}, ${displayUser.address.country}`
                                    : "Not set"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Wrap với ProtectedRoute
const ProfileSettingsPage = () => {
    return (
        <ProtectedRoute>
            <ProfileSettings />
        </ProtectedRoute>
    );
};

export default ProfileSettingsPage;
