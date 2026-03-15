
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PaymentTimerProvider } from './contexts/PaymentTimerContext';
import { ToastProvider } from './components/common/ToastProvider';
import { FloatingPaymentTimer } from './components/payment/FloatingPaymentTimer';
import type { UserRole } from '../../shared/type';
import { ROUTES } from './constants/routes';

// Layouts
import { ClientLayout } from './layouts/ClientLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { OrganizerLayout } from './layouts/OrganizerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Client Pages
import {
  HomePage,
  SearchPage,
  EventDetailsPage,
  ZoneSelectionPage,
  PaymentSuccessPage,
  PaymentCancelPage,
  ProfilePage,
  WishlistPage,
  MyTicketsPage,
  TransactionHistoryPage,
  RefundRequestPage,
} from './pages/client';
import { MyVouchersPage } from './pages/client/MyVouchersPage';
import Venue3DPage from './pages/client/Venue3DPage';
import PublicTicketPage from './pages/public/PublicTicketPage';

// Auth Pages
import { LoginPage, RegisterPage, OTPPage, ResetPasswordPage } from './pages/auth';

// Organizer Pages
import {
  DashboardPage as OrganizerDashboard,
  CreateEventPage,
  EditEventPage,
  EventDetailPage,
  AttendeesPage,
  AnalyticsPage,
  EventsPage,
  ManageVouchersPage,
  ManageStaffPage,
  StaffDetailPage,
  NotificationsPage,
  CheckInPage,
  ManageTicketPage,
  ManageOrdersPage,
} from './pages/organizer';

// Admin Pages
import {
  PayoutsPage,
  UsersPage,
  LayoutEditorPage,
  LayoutApiTestPage,
  EventApprovalPage,
  RefundRequestsPage,
  AdminAnalyticsPage,
  AdminSettingsPage,
} from './pages/admin';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'customer') return <Navigate to={ROUTES.HOME} replace />;
    if (user.role === 'organizer') return <Navigate to={ROUTES.ORGANIZER_HUB} replace />;
    if (user.role === 'admin') return <Navigate to={ROUTES.ADMIN_PAYOUTS} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetRole = searchParams.get('role');

  return (
    <Routes>
      {/* Public Client Routes */}
      <Route path={ROUTES.HOME} element={<ClientLayout><HomePage /></ClientLayout>} />
      <Route path={ROUTES.SEARCH} element={<ClientLayout><SearchPage /></ClientLayout>} />
      <Route path={ROUTES.EVENT_DETAILS} element={<ClientLayout><EventDetailsPage /></ClientLayout>} />
      <Route path={ROUTES.ZONE_SELECTION} element={<ZoneSelectionPage />} />
      <Route path="/event/:id/venue-3d" element={<Venue3DPage />} />
      <Route path="/t/:ticketId" element={<PublicTicketPage />} />

      {/* Protected Client Routes */}
      <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccessPage />} />
      <Route path={ROUTES.PAYMENT_CANCEL} element={<PaymentCancelPage />} />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.WISHLIST}
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ClientLayout><WishlistPage /></ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MY_TICKETS}
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ClientLayout><MyTicketsPage /></ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MY_VOUCHERS}
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ClientLayout><MyVouchersPage /></ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.TRANSACTION_HISTORY}
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ClientLayout><TransactionHistoryPage /></ClientLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.REFUND_REQUESTS}
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <ClientLayout><RefundRequestPage /></ClientLayout>
          </ProtectedRoute>
        }
      />

      {/* Auth Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          isAuthenticated
            ? <Navigate to={ROUTES.HOME} replace />
            : <AuthLayout><LoginPage /></AuthLayout>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          isAuthenticated && !targetRole
            ? <Navigate to={ROUTES.HOME} replace />
            : <AuthLayout><RegisterPage /></AuthLayout>
        }
      />
      <Route path={ROUTES.OTP} element={<AuthLayout><OTPPage /></AuthLayout>} />
      <Route path={ROUTES.RESET_PASSWORD} element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />

      {/* Organizer Routes */}
      <Route
        path={ROUTES.ORGANIZER_HUB}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Dashboard"><OrganizerDashboard /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CREATE_EVENT}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Create Event"><CreateEventPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ATTENDEES}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Attendees"><AttendeesPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ORGANIZER_ANALYTICS}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Analytics"><AnalyticsPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ORGANIZER_EVENTS}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="My Events"><EventsPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/events/:eventId"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Event Details"><EventDetailPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/events/:eventId/edit"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Edit Event"><EditEventPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/events/:eventId/tickets"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Manage Tickets"><ManageTicketPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MANAGE_VOUCHERS}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Manage Vouchers"><ManageVouchersPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MANAGE_STAFF}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Manage Staff"><ManageStaffPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/staff/:staffId"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Staff Details"><StaffDetailPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MANAGE_ORDERS}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Manage Orders"><ManageOrdersPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Notifications"><NotificationsPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CHECK_IN}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Check-In"><CheckInPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STAGE_BUILDER}
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout title="Stage Builder" fullWidth><LayoutEditorPage /></OrganizerLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path={ROUTES.ADMIN_PAYOUTS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="Payouts"><PayoutsPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_USERS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="Users"><UsersPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LAYOUT_EDITOR}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="Layout Editor" fullWidth><LayoutEditorPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.LAYOUT_API_TEST} element={<LayoutApiTestPage />} />
      <Route
        path={ROUTES.ADMIN_EVENT_APPROVALS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="Event Approvals"><EventApprovalPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_REFUND_REQUESTS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="Refund Requests"><RefundRequestsPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_ANALYTICS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="Analytics"><AdminAnalyticsPage /></AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SETTINGS}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="Settings"><AdminSettingsPage /></AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};

// Main App Content
const AppContent: React.FC = () => {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0a2e]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-sm">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppRoutes />
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <AuthProvider>
          <PaymentTimerProvider>
            <ToastProvider>
              <AppContent />
              <FloatingPaymentTimer />
            </ToastProvider>
          </PaymentTimerProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};


export default App;
