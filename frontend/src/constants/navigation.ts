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
    { name: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { name: 'Event Queue', icon: 'inbox', path: '/admin/events' },
    { name: 'Organizers', icon: 'group', path: '/admin/users' },
    { name: 'Analytics', icon: 'insights', path: '/admin/analytics' },
    { name: 'Settings', icon: 'settings', path: '/admin/settings' },
];

// Sidebar items for Organizer
export const organizerSidebarItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/organizer' },
    { name: 'Events', icon: 'calendar_month', path: '/organizer/events' },
    { name: 'Orders', icon: 'receipt_long', path: '/organizer/orders' },
    { name: 'Payouts', icon: 'payments', path: '/organizer/payouts' },
    { name: 'Team', icon: 'group', path: '/organizer/team' },
    { name: 'Analytics', icon: 'bar_chart', path: '/organizer/analytics' },
    { name: 'Settings', icon: 'settings', path: '/organizer/settings' },
];
