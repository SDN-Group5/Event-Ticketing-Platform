// Screen types
export type ScreenName =
    | 'ClientHome'
    | 'SearchResults'
    | 'EventDetails'
    | 'ZoneSelection'
    | 'Checkout'
    | 'PaymentSuccess'
    | 'UserProfile'
    | 'TicketModal'
    | 'Login'
    | 'OTP'
    | 'ResetPassword'
    | 'LogoutModal'
    | 'OrganizerHub'
    | 'OrganizerAdmin'
    | 'CreateEvent'
    | 'AttendeeList'
    | 'OrganizerAnalytics'
    | 'AdminPayouts'
    | 'AdminEventQueue'
    | 'AdminUsers'
    | 'LayoutEditor';

// Navigation item type
export interface NavItem {
    name: string;
    screen: ScreenName;
    icon: string;
    category: 'Client' | 'Organizer' | 'Admin' | 'Auth';
}

// Sidebar item type
export interface SidebarItem {
    name: string;
    icon: string;
    path: string;
}
