import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import { useUserStore } from "../stores/userStore";
import LoadingSpinner from "../components/LoadingSpinner";
import TicketVibeNavbar from "../components/common/TicketVibeNavbar";
import TicketVibeFooter from "../components/common/TicketVibeFooter";

const Profile = () => {
    const { currentUser, setCurrentUser } = useUserStore();
    const navigate = useNavigate();

    // Fetch user info nếu chưa có
    const { data: user, isLoading } = useQuery({
        queryKey: ["fetchCurrentUser"],
        queryFn: async () => {
            const userData = await apiClient.fetchCurrentUser();
            setCurrentUser(userData);
            return userData;
        },
        retry: false,
        enabled: !!currentUser || true, // Fetch nếu chưa có hoặc luôn fetch
    });

    const displayUser = user || currentUser;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-dark">
                <TicketVibeNavbar />
                <LoadingSpinner message="Đang tải thông tin profile..." />
            </div>
        );
    }

    if (!displayUser) {
        return (
            <div className="min-h-screen bg-background-dark">
                <TicketVibeNavbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <p className="text-white text-lg mb-4">Không tìm thấy thông tin user</p>
                        <Link
                            to="/sign-in"
                            className="text-primary hover:underline"
                        >
                            Đăng nhập lại
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const fullName = displayUser.firstName && displayUser.lastName
        ? `${displayUser.firstName} ${displayUser.lastName}`
        : displayUser.email || "User";

    const memberSince = displayUser.createdAt
        ? new Date(displayUser.createdAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
        })
        : "Recently";

    return (
        <div className="min-h-screen bg-background-dark">
            <TicketVibeNavbar />

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">
                {/* Hero Section */}
                <div className="relative w-full mb-8">
                    <div
                        className="h-[320px] w-full rounded-xl bg-cover bg-center overflow-hidden relative shadow-2xl"
                        style={{
                            backgroundImage: `linear-gradient(0deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.1) 100%), url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200')`,
                        }}
                    >
                        <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col md:flex-row items-end justify-between gap-6 glass-card rounded-b-xl border-t-0 border-x-0">
                            <div className="flex items-center gap-6">
                                <div
                                    className="size-32 rounded-full border-4 border-primary shadow-xl transform translate-y-[-20px] md:translate-y-0 flex items-center justify-center bg-cover bg-center"
                                    style={{
                                        backgroundImage: displayUser.avatar
                                            ? `url(${displayUser.avatar})`
                                            : undefined,
                                    }}
                                >
                                    {!displayUser.avatar && (
                                        <span className="text-white text-4xl font-bold bg-gradient-to-br from-primary to-[#a881ff] w-full h-full rounded-full flex items-center justify-center">
                                            {displayUser.firstName?.[0]?.toUpperCase() || displayUser.email?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col mb-2">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-white text-3xl font-bold tracking-tight">{fullName}</h1>
                                        {displayUser.emailVerified && (
                                            <span className="material-symbols-outlined text-primary text-[20px] fill-[1]">
                                                verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col text-slate-300 text-sm">
                                        <p className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            Member since {memberSince}
                                        </p>
                                        {displayUser.role && (
                                            <p className="flex items-center gap-1 text-primary/90 font-medium capitalize">
                                                <span className="material-symbols-outlined text-[14px]">stars</span>
                                                {displayUser.role} Account
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/profile/settings")}
                                className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:brightness-110 transition-all shadow-lg shadow-primary/20 gap-2 mb-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                <span>Quick Edit</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Left Sidebar Navigation */}
                    <aside className="md:col-span-3 space-y-6">
                        <div className="glass-card rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-3 px-3 py-4 mb-2 border-b border-slate-700/50">
                                <div className="bg-primary/20 text-primary p-2 rounded-lg">
                                    <span className="material-symbols-outlined">dashboard</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-bold">Navigation</h3>
                                    <p className="text-slate-400 text-xs">Manage account</p>
                                </div>
                            </div>
                            <nav className="space-y-1">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white transition-all group"
                                >
                                    <span className="material-symbols-outlined text-[22px] fill-[1]">grid_view</span>
                                    <span className="text-sm font-semibold">Overview</span>
                                </Link>
                                <Link
                                    to="/customer/tickets"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
                                >
                                    <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
                                    <span className="text-sm font-medium">My Tickets</span>
                                    <span className="ml-auto bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        0
                                    </span>
                                </Link>
                                <Link
                                    to="/profile/settings"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
                                >
                                    <span className="material-symbols-outlined text-[22px]">settings</span>
                                    <span className="text-sm font-medium">Settings</span>
                                </Link>
                                <Link
                                    to="/profile/payments"
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all group"
                                >
                                    <span className="material-symbols-outlined text-[22px]">payments</span>
                                    <span className="text-sm font-medium">Payment Methods</span>
                                </Link>
                                <div className="border-t border-slate-700/50 mt-4"></div>
                            </nav>
                        </div>

                        <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 size-24 bg-primary/20 blur-3xl rounded-full transition-all group-hover:scale-150"></div>
                            <h4 className="text-white text-lg font-bold mb-2">Need help?</h4>
                            <p className="text-slate-400 text-sm mb-4">Our support team is available 24/7 for you.</p>
                            <button className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium border border-slate-700 hover:bg-slate-700 transition-all">
                                Contact Support
                            </button>
                        </div>
                    </aside>

                    {/* Right Content Area */}
                    <div className="md:col-span-9 space-y-8">
                        {/* Recent Activity Section */}
                        <section>
                            <div className="flex items-center justify-between px-2 pb-4">
                                <h2 className="text-white text-[22px] font-bold tracking-tight">Recent Activity</h2>
                                <button className="text-primary text-sm font-medium hover:underline">View all</button>
                            </div>
                            <div className="glass-card rounded-xl overflow-hidden divide-y divide-slate-700/50">
                                {/* Empty State */}
                                <div className="flex items-center justify-center p-12">
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-slate-500 text-6xl mb-4 block">
                                            event_busy
                                        </span>
                                        <p className="text-slate-400 text-sm">Chưa có hoạt động nào</p>
                                        <Link
                                            to="/"
                                            className="text-primary hover:underline text-sm font-medium mt-2 inline-block"
                                        >
                                            Khám phá sự kiện
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Recommended Section */}
                        <section>
                            <div className="flex items-center justify-between px-2 pb-4">
                                <h2 className="text-white text-[22px] font-bold tracking-tight">Recommended for You</h2>
                                <div className="flex gap-2">
                                    <button className="size-8 rounded-full glass-card flex items-center justify-center text-white hover:bg-primary/20 transition-all">
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <button className="size-8 rounded-full glass-card flex items-center justify-center text-white hover:bg-primary/20 transition-all">
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-2 px-2">
                                {/* Empty State */}
                                <div className="w-full text-center py-12">
                                    <span className="material-symbols-outlined text-slate-500 text-6xl mb-4 block">
                                        event_available
                                    </span>
                                    <p className="text-slate-400 text-sm mb-2">Chưa có sự kiện được đề xuất</p>
                                    <Link
                                        to="/"
                                        className="text-primary hover:underline text-sm font-medium"
                                    >
                                        Khám phá sự kiện
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <TicketVibeFooter />
        </div>
    );
};

export default Profile;
