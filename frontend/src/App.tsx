import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';

// Layouts
import { ClientLayout } from './layouts/ClientLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { OrganizerLayout } from './layouts/OrganizerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Client Pages
import { HomePage, SearchPage, EventDetailsPage, ZoneSelectionPage, CheckoutPage, PaymentSuccessPage, ProfilePage, WishlistPage, MyTicketsPage, RefundRequestPage } from './pages/client';
import Venue3DPage from './pages/client/Venue3DPage';

// Auth Pages
import { LoginPage, SignupPage, OTPPage, ResetPasswordPage } from './pages/auth';

// Organizer Pages
import { DashboardPage as OrganizerDashboard, CreateEventPage, AttendeesPage, AnalyticsPage, EventsPage, ManageVouchersPage, ManageStaffPage, NotificationsPage, CheckInPage } from './pages/organizer';

// Admin Pages  
import { PayoutsPage, EventQueuePage, UsersPage, LayoutEditorPage, LayoutApiTestPage, EventApprovalsPage, RefundRequestsPage, AdminAnalyticsPage, AdminSettingsPage } from './pages/admin';

// Role Switcher Component (Demo purposes)
const RoleSwitcher: React.FC = () => {
    const { user, switchRole, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const roles: { role: UserRole; label: string; icon: string; color: string }[] = [
        { role: 'customer', label: 'Customer', icon: 'person', color: 'from-blue-500 to-cyan-500' },
        { role: 'organizer', label: 'Organizer', icon: 'event', color: 'from-purple-500 to-pink-500' },
        { role: 'admin', label: 'Admin', icon: 'admin_panel_settings', color: 'from-orange-500 to-red-500' },
    ];

    const handleRoleSwitch = (role: UserRole) => {
        switchRole(role);
        setIsOpen(false);
        // Navigate to appropriate dashboard
        if (role === 'customer') navigate('/');
        else if (role === 'organizer') navigate('/organizer');
        else if (role === 'admin') navigate('/admin/payouts');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    return (
        <div className="fixed top-4 right-4 z-[200]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-full text-white shadow-xl hover:bg-[#1e293b] transition-all"
                title={isAuthenticated && user ? `Signed in as ${user.name} (${user.role})` : "Sign In"}
            >
                {isAuthenticated && user ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0)}
                    </div>
                ) : (
                    <span className="material-symbols-outlined text-xl">login</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        {isAuthenticated && user && (
                            <div className="mb-3 pb-3 border-b border-white/10 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8655f6] to-[#d946ef] flex items-center justify-center text-sm font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{user.name}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${user.role === 'admin' ? 'bg-orange-500/20 text-orange-400' :
                                        user.role === 'organizer' ? 'bg-purple-500/20 text-purple-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>{user.role}</span>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 uppercase font-bold mb-3">Switch Role (Demo)</p>
                        <div className="space-y-2">
                            {roles.map(({ role, label, icon, color }) => (
                                <button
                                    key={role}
                                    onClick={() => handleRoleSwitch(role)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${user?.role === role
                                        ? 'bg-white/10 ring-1 ring-white/20'
                                        : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-white">{icon}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-white">{label}</p>
                                        <p className="text-[11px] text-gray-400">
                                            {role === 'customer' ? 'Browse & buy tickets' :
                                                role === 'organizer' ? 'Manage events' :
                                                    'System administration'}
                                        </p>
                                    </div>
                                    {user?.role === role && (
                                        <span className="material-symbols-outlined text-emerald-400 ml-auto">check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    {isAuthenticated && (
                        <div className="p-3">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Quick Navigation Bar
const QuickNav: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated) return null;

    // Hide QuickNav on specific pages (booking flow, layout editor)
    const hiddenRoutes = ['/zones', '/checkout', '/payment-success', '/layout-editor'];
    const isHidden = hiddenRoutes.some(route => location.pathname.includes(route));

    if (isHidden) return null;

    const navItems = user?.role === 'customer' ? [
        { path: '/', label: 'Home', icon: 'home' },
        { path: '/search', label: 'Search', icon: 'search' },
        { path: '/profile', label: 'Profile', icon: 'person' },
    ] : user?.role === 'organizer' ? [
        { path: '/organizer', label: 'Dashboard', icon: 'dashboard' },
        { path: '/organizer/create-event', label: 'Create Event', icon: 'add_circle' },
        { path: '/organizer/attendees', label: 'Attendees', icon: 'group' },
        { path: '/organizer/analytics', label: 'Analytics', icon: 'insights' },
    ] : [
        { path: '/admin/payouts', label: 'Payouts', icon: 'payments' },
        { path: '/admin/events', label: 'Events', icon: 'queue' },
        { path: '/admin/users', label: 'Users', icon: 'manage_accounts' },
        { path: '/admin/layout-editor', label: 'Layout', icon: 'edit_square' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[#151022]/95 backdrop-blur-lg border-t border-[#2d2839] shadow-xl">
            <div className="max-w-lg mx-auto px-4 py-2">
                <div className="flex justify-around">
                    {navItems.map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${location.pathname === item.path
                                ? 'text-[#8655f6]'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${location.pathname === item.path ? 'filled' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

// Protected Route Component
const ProtectedRoute: React.FC<{
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard
        if (user.role === 'customer') return <Navigate to="/" replace />;
        if (user.role === 'organizer') return <Navigate to="/organizer" replace />;
        if (user.role === 'admin') return <Navigate to="/admin/payouts" replace />;
    }

    return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Client Routes */}
            <Route path="/" element={<ClientLayout><HomePage /></ClientLayout>} />
            <Route path="/search" element={<ClientLayout><SearchPage /></ClientLayout>} />
            <Route path="/event/:id" element={<ClientLayout><EventDetailsPage /></ClientLayout>} />
            <Route path="/event/:id/zones" element={<ZoneSelectionPage />} />
            <Route path="/event/:id/venue-3d" element={<Venue3DPage />} />

            {/* Protected Client Routes */}
            <Route path="/checkout" element={
                <ProtectedRoute allowedRoles={['customer']}>
                    <CheckoutPage />
                </ProtectedRoute>
            } />
            <Route path="/payment-success" element={
                <ProtectedRoute allowedRoles={['customer']}>
                    <PaymentSuccessPage />
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['customer']}>
                    <ProfilePage />
                </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
                <ProtectedRoute allowedRoles={['customer']}>
                    <ClientLayout><WishlistPage /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/my-tickets" element={
                <ProtectedRoute allowedRoles={['customer']}>
                    <ClientLayout><MyTicketsPage /></ClientLayout>
                </ProtectedRoute>
            } />
            <Route path="/refund-requests" element={
                <ProtectedRoute allowedRoles={['customer']}>
                    <ClientLayout><RefundRequestPage /></ClientLayout>
                </ProtectedRoute>
            } />

            {/* Auth Routes */}
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout><LoginPage /></AuthLayout>
            } />
            <Route path="/signup" element={
                isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout><SignupPage /></AuthLayout>
            } />
            <Route path="/otp" element={<AuthLayout><OTPPage /></AuthLayout>} />
            <Route path="/reset-password" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />

            {/* Organizer Routes */}
            <Route path="/organizer" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Dashboard"><OrganizerDashboard /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/create-event" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Create Event"><CreateEventPage /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/attendees" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Attendees"><AttendeesPage /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/analytics" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Analytics"><AnalyticsPage /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/events" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="My Events"><EventsPage /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/vouchers" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Manage Vouchers"><ManageVouchersPage /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/staff" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Manage Staff"><ManageStaffPage /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/notifications" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Notifications"><NotificationsPage /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/check-in" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Check-In"><CheckInPage /></OrganizerLayout>
                </ProtectedRoute>
            } />
            <Route path="/organizer/stage-builder" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                    <OrganizerLayout title="Stage Builder" fullWidth><LayoutEditorPage /></OrganizerLayout>
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/payouts" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout title="Payouts"><PayoutsPage /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout title="Event Queue"><EventQueuePage /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout title="Users"><UsersPage /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/layout-editor" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout title="Layout Editor" fullWidth><LayoutEditorPage /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/layout-api-test" element={<LayoutApiTestPage />} />
            <Route path="/admin/event-approvals" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout title="Event Approvals"><EventApprovalsPage /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/refund-requests" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout title="Organizer Payouts"><OrganizerPayoutsPage /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout title="Analytics"><AdminAnalyticsPage /></AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout title="Settings"><AdminSettingsPage /></AdminLayout>
                </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

// Main App Content
const AppContent: React.FC = () => {
    return (
        <div>
            <AppRoutes />
        </div>
    );
};

// Main App Component
const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;
