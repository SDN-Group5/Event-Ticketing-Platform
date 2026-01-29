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

export interface NavItem {
  name: string;
  screen: ScreenName;
  icon: string;
  category: 'Client' | 'Organizer' | 'Admin' | 'Auth';
}