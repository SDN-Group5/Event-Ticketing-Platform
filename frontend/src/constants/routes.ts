// Route constants
export const ROUTES = {
  // Client routes
  HOME: '/',
  SEARCH: '/search',
  EVENT_DETAILS: '/event/:id',
  ZONE_SELECTION: '/event/:id/zones',
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment-success',
  PAYMENT_CANCEL: '/payment-cancel',
  PROFILE: '/profile',
  WISHLIST: '/wishlist',
  MY_TICKETS: '/my-tickets',
  TRANSACTION_HISTORY: '/transaction-history',
  REFUND_REQUESTS: '/refund-requests',

  // Auth routes
  LOGIN: '/login',
  OTP: '/otp',
  RESET_PASSWORD: '/reset-password',

  // Organizer routes
  ORGANIZER_HUB: '/organizer',
  ORGANIZER_ADMIN: '/organizer/admin',
  CREATE_EVENT: '/organizer/create-event',
  ORGANIZER_EVENTS: '/organizer/events',
  ATTENDEES: '/organizer/attendees',
  ORGANIZER_ANALYTICS: '/organizer/analytics',
  MANAGE_VOUCHERS: '/organizer/vouchers',
  MANAGE_STAFF: '/organizer/staff',
  NOTIFICATIONS: '/organizer/notifications',
  CHECK_IN: '/organizer/check-in',
  STAGE_BUILDER: '/organizer/stage-builder',

  // Admin routes
  ADMIN_PAYOUTS: '/admin/payouts',
  ADMIN_EVENT_QUEUE: '/admin/events',
  ADMIN_USERS: '/admin/users',
  LAYOUT_EDITOR: '/admin/layout-editor',
  LAYOUT_API_TEST: '/admin/layout-api-test',
  ADMIN_EVENT_APPROVALS: '/admin/event-approvals',
  ADMIN_REFUND_REQUESTS: '/admin/refund-requests',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type Route = typeof ROUTES[RouteKey];
