import { Link, useNavigate } from "react-router-dom";
import useAppContext from "../../hooks/useAppContext";
import { useUserStore } from "../../stores/userStore";
import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithLoading } from "../../hooks/useLoadingHooks";
import * as apiClient from "../../api-client";
import { LogOut, User, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function TicketVibeNavbar() {
    const { isLoggedIn, showToast } = useAppContext();
    const { currentUser, getUserRole, isCustomer, isOrganizer, isStaff, isAdmin, clearCurrentUser } = useUserStore();
    const userRole = getUserRole();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const logoutMutation = useMutationWithLoading(apiClient.signOut, {
        onSuccess: async () => {
            clearCurrentUser();
            await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
            await queryClient.invalidateQueries({ queryKey: ["fetchCurrentUser"] });
            showToast({
                title: "Đã đăng xuất",
                description: "Bạn đã đăng xuất thành công.",
                type: "SUCCESS",
            });
            navigate("/");
            setTimeout(() => window.location.reload(), 500);
        },
        onError: (error: Error) => {
            showToast({
                title: "Đăng xuất thất bại",
                description: error.message,
                type: "ERROR",
            });
        },
        loadingMessage: "Đang đăng xuất...",
    });

    const handleLogout = () => {
        logoutMutation.mutate(undefined);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[#2d2839] glass-panel px-4 md:px-10 py-3">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-primary to-neon-pink text-white shadow-[0_0_15px_rgba(137,90,246,0.5)]">
                        <span className="material-symbols-outlined text-[24px]">
                            confirmation_number
                        </span>
                    </div>
                    <h2 className="hidden md:block text-white text-xl font-bold tracking-tight">
                        SDNTicket
                    </h2>
                </Link>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-lg mx-4">
                    <label className="flex w-full items-center h-11 rounded-xl bg-[#2d2839]/50 border border-white/5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all overflow-hidden">
                        <div className="flex items-center justify-center pl-4 text-[#a59cba]">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="w-full bg-transparent border-none text-white placeholder:text-[#a59cba] focus:ring-0 px-3 text-sm font-normal"
                            placeholder="Search events, artists, or venues..."
                        />
                    </label>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* My Tickets - chỉ hiện cho customer */}
                    {isLoggedIn && isCustomer() && (
                        <Link
                            to="/customer/tickets"
                            className="hidden sm:flex h-10 items-center justify-center px-4 rounded-xl hover:bg-white/5 text-white text-sm font-bold transition-colors"
                        >
                            My Tickets
                        </Link>
                    )}

                    {/* Dashboard links theo role */}
                    {isLoggedIn && isOrganizer() && (
                        <Link
                            to="/dashboard/organizer"
                            className="hidden sm:flex h-10 items-center justify-center px-4 rounded-xl hover:bg-white/5 text-white text-sm font-bold transition-colors"
                        >
                            Organizer Dashboard
                        </Link>
                    )}

                    {isLoggedIn && isStaff() && (
                        <Link
                            to="/dashboard/staff"
                            className="hidden sm:flex h-10 items-center justify-center px-4 rounded-xl hover:bg-white/5 text-white text-sm font-bold transition-colors"
                        >
                            Staff Dashboard
                        </Link>
                    )}

                    {isLoggedIn && isAdmin() && (
                        <Link
                            to="/dashboard/admin"
                            className="hidden sm:flex h-10 items-center justify-center px-4 rounded-xl hover:bg-white/5 text-white text-sm font-bold transition-colors"
                        >
                            Admin Dashboard
                        </Link>
                    )}

                    {/* Account/Login Button */}
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex h-10 items-center justify-center gap-2 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-[0_4px_14px_0_rgba(137,90,246,0.39)] transition-all transform hover:scale-105">
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                        {currentUser?.firstName || currentUser?.email || "Account"}
                                    </span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 bg-[#1e1a29] border border-white/10 text-white"
                                align="end"
                            >
                                {/* User Info */}
                                <div className="px-3 py-2 border-b border-white/10">
                                    <p className="text-sm font-semibold text-white">
                                        {currentUser?.firstName && currentUser?.lastName
                                            ? `${currentUser.firstName} ${currentUser.lastName}`
                                            : currentUser?.email || "User"}
                                    </p>
                                    <p className="text-xs text-white/60 mt-1">
                                        {currentUser?.email}
                                    </p>
                                    {userRole && (
                                        <p className="text-xs text-primary mt-1 capitalize">
                                            {userRole}
                                        </p>
                                    )}
                                </div>

                                <DropdownMenuSeparator className="bg-white/10" />

                                {/* Profile Link */}
                                <DropdownMenuItem
                                    asChild
                                    className="text-white focus:bg-white/10 focus:text-white cursor-pointer"
                                >
                                    <Link to="/profile">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>

                                {/* Logout */}
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-400 focus:bg-white/10 focus:text-red-400 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link
                            to="/sign-in"
                            className="flex h-10 items-center justify-center px-6 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-[0_4px_14px_0_rgba(137,90,246,0.39)] transition-all transform hover:scale-105"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

