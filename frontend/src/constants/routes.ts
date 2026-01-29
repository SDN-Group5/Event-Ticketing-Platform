// Route constants
export const ROUTES = {
  // Client routes
  HOME: '/',
  SEARCH: '/search',
  EVENT_DETAILS: '/event/:id',
  ZONE_SELECTION: '/event/:id/zones',
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment-success',
  PROFILE: '/profile',
  
  // Auth routes
  LOGIN: '/login',
  OTP: '/otp',
  RESET_PASSWORD: '/reset-password',
  
  // Organizer routes
  ORGANIZER_HUB: '/organizer',
  ORGANIZER_ADMIN: '/organizer/admin',
  CREATE_EVENT: '/organizer/create-event',
  ATTENDEES: '/organizer/attendees',
  ORGANIZER_ANALYTICS: '/organizer/analytics',
  
  // Admin routes
  ADMIN_PAYOUTS: '/admin/payouts',
  ADMIN_EVENT_QUEUE: '/admin/events',
  ADMIN_USERS: '/admin/users',
  LAYOUT_EDITOR: '/admin/layout-editor',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type Route = typeof ROUTES[RouteKey];
