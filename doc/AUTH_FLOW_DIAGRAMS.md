# Web Authentication Flow - Visual Guide

## Registration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER REGISTRATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION PAGE
   ┌──────────────────────────────────┐
   │  /register                       │
   │  ├─ First Name                   │
   │  ├─ Last Name                    │
   │  ├─ Email Address                │
   │  ├─ Password (min 6 chars)       │
   │  └─ Confirm Password             │
   └────────────┬──────────────────────┘
                │ Submit
                ▼
2. BACKEND REGISTER
   ┌──────────────────────────────────┐
   │  POST /api/auth/register         │
   │  ├─ Create User in DB            │
   │  ├─ Hash Password                │
   │  ├─ Set role: 'customer'         │
   │  ├─ Generate OTP Code            │
   │  └─ Send Email                   │
   └────────────┬──────────────────────┘
                │ 201 Created
                ▼
3. OTP VERIFICATION PAGE
   ┌──────────────────────────────────┐
   │  /otp                            │
   │  ├─ Enter 6-digit code           │
   │  └─ Resend code button           │
   └────────────┬──────────────────────┘
                │ Submit
                ▼
4. BACKEND VERIFY EMAIL
   ┌──────────────────────────────────┐
   │  POST /api/auth/verify-email     │
   │  ├─ Check OTP code               │
   │  ├─ Check expiry (1 minute)      │
   │  └─ Mark emailVerified: true     │
   └────────────┬──────────────────────┘
                │ 200 OK
                ▼
5. LOGIN PAGE
   ┌──────────────────────────────────┐
   │  /login                          │
   │  ├─ Email                        │
   │  └─ Password                     │
   └─────────────────────────────────┘
```

## Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN PAGE
   ┌──────────────────────────────────┐
   │  /login                          │
   │  ├─ Email                        │
   │  └─ Password                     │
   └────────────┬──────────────────────┘
                │ Submit
                ▼
2. BACKEND LOGIN
   ┌──────────────────────────────────┐
   │  POST /api/auth/login            │
   │  ├─ Find user by email           │
   │  ├─ Verify password with bcrypt  │
   │  ├─ Check emailVerified: true    │
   │  ├─ Generate JWT token           │
   │  ├─ Set httpOnly cookie          │
   │  └─ Return token + user info     │
   └────────────┬──────────────────────┘
                │ 200 OK
                ▼
3. FRONTEND SAVES TOKEN
   ┌──────────────────────────────────┐
   │  localStorage.setItem(           │
   │    'auth_token', token           │
   │  )                               │
   └────────────┬──────────────────────┘
                │ Set user state
                ▼
4. REDIRECT BASED ON ROLE
   ┌──────────────────────────────────┐
   │  if (role === 'customer')        │
   │    → /                           │
   │  else if (role === 'organizer')  │
   │    → /organizer                  │
   │  else if (role === 'admin')      │
   │    → /admin/payouts              │
   └──────────────────────────────────┘
```

## Session Restoration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   SESSION RESTORATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

1. APP LOADS
   ┌──────────────────────────────────┐
   │  App.tsx renders                 │
   │  AuthContext initializes         │
   └────────────┬──────────────────────┘
                │
                ▼
2. CHECK LOCALSTORAGE
   ┌──────────────────────────────────┐
   │  Get 'auth_token' from          │
   │  localStorage                    │
   │  ├─ If found: Continue           │
   │  └─ If not: Stay logged out      │
   └────────────┬──────────────────────┘
                │ Token found
                ▼
3. VERIFY TOKEN
   ┌──────────────────────────────────┐
   │  GET /api/users/me               │
   │  Headers: {                      │
   │    Authorization: 'Bearer TOKEN' │
   │  }                               │
   └────────────┬──────────────────────┘
                │ 200 OK
                ▼
4. RESTORE USER STATE
   ┌──────────────────────────────────┐
   │  setUser({                       │
   │    id, name, email, role, avatar │
   │  })                              │
   │  isAuthenticated = true          │
   └──────────────────────────────────┘
```

## Protected Route Access Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   PROTECTED ROUTE ACCESS FLOW                    │
└─────────────────────────────────────────────────────────────────┘

User tries to access: /my-tickets
                │
                ▼
         ┌──────────────────────────────┐
         │ ProtectedRoute component     │
         │ Checks:                      │
         │ ├─ isAuthenticated?          │
         │ └─ allowedRoles?             │
         └──┬───────────────┬───────────┘
            │               │
       NOT LOGGED IN    NOT AUTHORIZED
            │               │
            ▼               ▼
      ┌──────────────┐  ┌──────────────┐
      │ Redirect to  │  │ Redirect to  │
      │ /login       │  │ / (or based  │
      │              │  │ on role)     │
      └──────────────┘  └──────────────┘
            
       Logged In + Authorized
            │
            ▼
      ┌──────────────┐
      │ Render page  │
      │ (MyTickets)  │
      └──────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHCONTEXT STATE FLOW                        │
└─────────────────────────────────────────────────────────────────┘

AuthContext provides:
┌──────────────────────────────────────────┐
│ user                                     │
│ ├─ null (not logged in)                 │
│ └─ { id, name, email, role, avatar }    │
│                                          │
│ isAuthenticated: boolean                 │
│ isInitializing: boolean                  │
│ isLoading: boolean                       │
│ error: string | null                     │
│                                          │
│ login(email, password)                   │
│ logout()                                 │
│ clearError()                             │
└──────────────────────────────────────────┘

Components use:
┌──────────────────────────────────────────┐
│ const { user, isAuthenticated } =        │
│   useAuth()                              │
│                                          │
│ Example:                                 │
│ if (!isAuthenticated) {                  │
│   return <Navigate to="/login" />        │
│ }                                        │
└──────────────────────────────────────────┘
```

## Token Lifecycle

```
TOKEN CREATION → STORAGE → USAGE → EXPIRY → RE-LOGIN

1. TOKEN CREATED
   Login successful
   → JWT token generated (expires in 1 day)
   → Stored in localStorage
   → Also set as httpOnly cookie

2. TOKEN STORED
   localStorage['auth_token'] = 'eyJhbGc...'
   Cookie: jwt=eyJhbGc... (httpOnly, secure)

3. TOKEN USED
   Every API request to protected endpoints:
   Headers: {
     Authorization: 'Bearer eyJhbGc...'
   }

4. TOKEN VERIFIED
   Backend verifies JWT signature
   Extracts userId
   Returns user data or 401 Unauthorized

5. TOKEN EXPIRES
   After 1 day:
   API returns 401 Unauthorized
   Frontend clears localStorage
   User redirected to /login

6. RE-LOGIN
   User logs in again
   New token generated
   Process repeats
```

## API Endpoint Summary

```
Authentication Endpoints:

PUBLIC (No token required)
┌─────────────────────────────────────┐
│ POST /api/auth/register             │
│ POST /api/auth/login                │
│ POST /api/auth/verify-email         │
│ POST /api/auth/resend-verification  │
│ POST /api/auth/forgot-password      │
│ POST /api/auth/verify-reset-code    │
│ POST /api/auth/reset-password       │
└─────────────────────────────────────┘

PROTECTED (Token required)
┌─────────────────────────────────────┐
│ GET  /api/users/me                  │
│ PATCH /api/users/me                 │
│ POST /api/auth/logout               │
│ GET  /api/auth/validate-token       │
│ GET  /api/users?role=admin          │
└─────────────────────────────────────┘
```

## Frontend Routes Summary

```
PUBLIC ROUTES (No login required)
├─ /                    Home (browse events)
├─ /search             Search events
├─ /event/:id          Event details
├─ /login              Login page
├─ /register           Registration page
└─ /reset-password     Reset password

CUSTOMER ROUTES (Login as customer)
├─ /profile            Edit profile
├─ /my-tickets         View purchased tickets
├─ /wishlist           Saved events
├─ /transaction-history Order history
└─ /refund-requests    Request refunds

ORGANIZER ROUTES (Login as organizer)
├─ /organizer          Dashboard
├─ /organizer/events   Manage events
├─ /organizer/attendees View attendees
├─ /organizer/analytics Event analytics
├─ /organizer/vouchers Manage discounts
├─ /organizer/staff    Manage staff
└─ /organizer/check-in Check-in attendees

ADMIN ROUTES (Login as admin)
├─ /admin/payouts      View payouts
├─ /admin/events       Event queue
├─ /admin/users        Manage users
├─ /admin/event-approvals Approve events
├─ /admin/refund-requests Handle refunds
└─ /admin/analytics    System analytics
```

## Key Differences: Before vs After

```
BEFORE (Mock Users)          AFTER (Real Authentication)
┌─────────────────────┐      ┌──────────────────────────┐
│ DEMO_USERS const    │      │ Backend Database         │
│ switchRole() button  │      │ Registration form        │
│ Instant login       │      │ Email verification       │
│ No persistence      │      │ JWT token system         │
│ No validation       │      │ Password hashing         │
│ Test only          │      │ Production ready         │
└─────────────────────┘      └──────────────────────────┘
```
