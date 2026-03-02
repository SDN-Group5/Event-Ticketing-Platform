import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
  CheckoutPage,
  PaymentSuccessPage,
  PaymentCancelPage,
  ProfilePage,
  WishlistPage,
  MyTicketsPage,
  TransactionHistoryPage,
  RefundRequestPage,
} from './pages/client';
import Venue3DPage from './pages/client/Venue3DPage';

// Auth Pages
import { LoginPage, OTPPage, ResetPasswordPage } from './pages/auth';

// Organizer Pages
import {
  DashboardPage as OrganizerDashboard,
  CreateEventPage,
  AttendeesPage,
  AnalyticsPage,
  EventsPage,
  ManageVouchersPage,
  ManageStaffPage,
  NotificationsPage,
  CheckInPage,
} from './pages/organizer';

// Admin Pages
import {
  PayoutsPage,
  EventQueuePage,
  UsersPage,
  LayoutEditorPage,
  LayoutApiTestPage,
  EventApprovalsPage,
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
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Client Routes */}
      <Route path={ROUTES.HOME} element={<ClientLayout><HomePage /></ClientLayout>} />
      <Route path={ROUTES.SEARCH} element={<ClientLayout><SearchPage /></ClientLayout>} />
      <Route path={ROUTES.EVENT_DETAILS} element={<ClientLayout><EventDetailsPage /></ClientLayout>} />
      <Route path={ROUTES.ZONE_SELECTION} element={<ZoneSelectionPage />} />
      <Route path="/event/:id/venue-3d" element={<Venue3DPage />} />

      {/* Protected Client Routes */}
      <Route
        path={ROUTES.PAYMENT_SUCCESS}
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />
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
        path={ROUTES.ADMIN_EVENT_QUEUE}
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout title="Event Queue"><EventQueuePage /></AdminLayout>
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
            <AdminLayout title="Event Approvals"><EventApprovalsPage /></AdminLayout>
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
