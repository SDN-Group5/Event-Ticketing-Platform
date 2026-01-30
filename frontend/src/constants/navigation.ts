import { NavItem, ScreenName } from '../types';

// Navigation configuration
export const navItems: NavItem[] = [
    { name: 'Home', screen: 'ClientHome', icon: 'home', category: 'Client' },
    { name: 'Search', screen: 'SearchResults', icon: 'search', category: 'Client' },
    { name: 'Event', screen: 'EventDetails', icon: 'event', category: 'Client' },
    { name: 'Zone', screen: 'ZoneSelection', icon: 'grid_view', category: 'Client' },
    { name: 'Checkout', screen: 'Checkout', icon: 'shopping_cart', category: 'Client' },
    { name: 'Success', screen: 'PaymentSuccess', icon: 'check_circle', category: 'Client' },
    { name: 'Profile', screen: 'UserProfile', icon: 'person', category: 'Client' },
    { name: 'Ticket Modal', screen: 'TicketModal', icon: 'confirmation_number', category: 'Client' },

    { name: 'Login', screen: 'Login', icon: 'login', category: 'Auth' },
    { name: 'OTP', screen: 'OTP', icon: 'pin', category: 'Auth' },
    { name: 'Reset', screen: 'ResetPassword', icon: 'lock_reset', category: 'Auth' },
    { name: 'Logout', screen: 'LogoutModal', icon: 'logout', category: 'Auth' },

    { name: 'Org Hub', screen: 'OrganizerHub', icon: 'dashboard', category: 'Organizer' },
    { name: 'Org Admin', screen: 'OrganizerAdmin', icon: 'admin_panel_settings', category: 'Organizer' },
    { name: 'Create Evt', screen: 'CreateEvent', icon: 'add_circle', category: 'Organizer' },
    { name: 'Attendees', screen: 'AttendeeList', icon: 'group', category: 'Organizer' },
    { name: 'Analytics', screen: 'OrganizerAnalytics', icon: 'insights', category: 'Organizer' },

    { name: 'Payouts', screen: 'AdminPayouts', icon: 'payments', category: 'Admin' },
    { name: 'Queue', screen: 'AdminEventQueue', icon: 'queue', category: 'Admin' },
    { name: 'Users', screen: 'AdminUsers', icon: 'manage_accounts', category: 'Admin' },
    { name: 'Editor', screen: 'LayoutEditor', icon: 'edit_square', category: 'Admin' },
];

// Sidebar items for Admin
export const adminSidebarItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/admin/payouts' },
    { name: 'Event Queue', icon: 'inbox', path: '/admin/events' },
    { name: 'Organizers', icon: 'group', path: '/admin/users' },
    { name: 'Event Approvals', icon: 'check_circle', path: '/admin/event-approvals' },
    { name: 'Refund Requests', icon: 'undo', path: '/admin/refund-requests' },
    { name: 'Analytics', icon: 'bar_chart', path: '/admin/analytics' },
    { name: 'Layout Editor', icon: 'edit_square', path: '/admin/layout-editor' },
    { name: 'Settings', icon: 'settings', path: '/admin/settings' },
];

// Sidebar items for Organizer
export const organizerSidebarItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/organizer' },
    { name: 'My Events', icon: 'event_note', path: '/organizer/events' },
    { name: 'Create Event', icon: 'add_circle', path: '/organizer/create-event' },
    { name: 'Attendees', icon: 'group', path: '/organizer/attendees' },
    { name: 'Vouchers', icon: 'card_giftcard', path: '/organizer/vouchers' },
    { name: 'Staff', icon: 'people', path: '/organizer/staff' },
    { name: 'Check-in', icon: 'qr_code_scanner', path: '/organizer/check-in' },
    { name: 'Stage Builder', icon: 'edit_square', path: '/organizer/stage-builder' },
    { name: 'Notifications', icon: 'notifications', path: '/organizer/notifications' },
    { name: 'Analytics', icon: 'bar_chart', path: '/organizer/analytics' },
];
