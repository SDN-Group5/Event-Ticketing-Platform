# Web Authentication Implementation Guide

## Overview
The web application now has a real authentication system without mock data. Users can:
- View the public homepage to preview events
- Register a new account
- Login with their credentials
- Access protected pages based on their role

## Key Changes Made

### 1. Removed Mock Authentication
- **File**: `frontend/src/contexts/AuthContext.tsx`
  - Removed `DEMO_USERS` constant
  - Removed `switchRole()` function
  - All authentication now requires real backend API calls

### 2. Updated Login Page
- **File**: `frontend/src/pages/auth/LoginPage.tsx`
  - Removed role selection UI
  - Simplified to email/password login only
  - Updated sign-up link to `/register`

### 3. Added Registration Page
- **File**: `frontend/src/pages/auth/RegisterPage.tsx` (NEW)
  - Full registration form with first/last name, email, password
  - Client-side validation
  - Password confirmation field
  - Links to login page

### 4. Updated Routing
- **File**: `frontend/src/App.tsx`
  - Added `/register` route for registration
  - Homepage remains public for previewing events

## Public vs Protected Routes

### Public Routes (No Login Required)
- `/` - Homepage (shows all events)
- `/search` - Search events
- `/event/:id` - Event details
- `/login` - Login page
- `/register` - Registration page
- `/reset-password` - Password reset

### Protected Routes (Login Required)
- `/profile` - Customer profile (requires `customer` role)
- `/my-tickets` - My tickets (requires `customer` role)
- `/wishlist` - Wishlist (requires `customer` role)
- `/transaction-history` - Order history (requires `customer` role)
- `/refund-requests` - Refund requests (requires `customer` role)
- `/organizer/*` - Organizer dashboard (requires `organizer` role)
- `/admin/*` - Admin dashboard (requires `admin` role)

## Authentication Flow

### Registration Flow
1. User visits `/register`
2. Enters first name, last name, email, and password
3. Submits form → calls `POST /api/auth/register`
4. Backend creates user with `role: 'customer'`
5. Sends verification email with OTP code
6. User redirected to `/otp` to verify email
7. After verification, user can login

### Login Flow
1. User visits `/login`
2. Enters email and password
3. Submits form → calls `POST /api/auth/login`
4. Backend validates credentials
5. Returns JWT token and user info
6. Frontend stores token in localStorage
7. User redirected based on role:
   - `customer` → `/`
   - `organizer` → `/organizer`
   - `admin` → `/admin/payouts`

### Session Restoration
- On page load, AuthContext checks for JWT token in localStorage
- Calls `GET /api/users/me` with token to restore session
- If token expired, user must login again

## Testing Instructions

### Test Backend First
Make sure auth-service is running:
```bash
cd backend/services/auth-service
npm install
npm run dev
```

### Test Registration
1. Go to `http://localhost:5173/register`
2. Fill form with test data:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Test123456
3. Submit
4. Check your email for OTP code (or check backend logs)
5. Go to `/otp` and enter code

### Test Login (After Email Verification)
1. Go to `http://localhost:5173/login`
2. Enter credentials:
   - Email: john@example.com
   - Password: Test123456
3. Submit
4. Should be redirected to homepage as logged-in user

### Test With Different Roles
Role assignment is handled by the backend. To test different roles:
1. In the auth service database, manually set user's role to `organizer` or `admin`
2. Or create test accounts with different roles via database

### Test Protected Routes
1. Try accessing `/profile` without login → redirect to `/login`
2. Login as customer
3. You should now access `/profile`
4. Try accessing `/organizer` as customer → redirect to `/`

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify-email` - Verify OTP code
- `POST /api/auth/resend-verification` - Resend OTP
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-code` - Verify reset code
- `POST /api/auth/reset-password` - Reset password

### User
- `GET /api/users/me` - Get current user info
- `PATCH /api/users/me` - Update user profile

## Token Storage
- JWT token stored in `localStorage` with key: `auth_token`
- Also set as httpOnly cookie on backend for additional security

## Environment Variables
Make sure `VITE_API_URL` is set in frontend `.env`:
```
VITE_API_URL=http://localhost:4001
```

## Next Steps (Optional)
1. **Email Configuration**: Set up email service to actually send verification emails
   - See `doc/EMAIL_SETUP.md`
2. **Google Authentication**: Implement Google OAuth login
3. **Social Media Login**: Add Facebook, Apple, etc.
4. **Multi-step Registration**: Add profile picture, preferences, etc.
5. **Two-Factor Authentication**: Add 2FA for security

## Troubleshooting

### "Email already exists" error
- Try registering with a different email address
- Or reset the database and try again

### "Cannot verify email" error
- Check the OTP code in backend logs
- Make sure you're entering the correct code
- OTP expires after 1 minute

### "User not found" on login
- Make sure you completed email verification
- Try registering again with a new email

### Token expired
- Just login again
- Token is valid for 1 day

## Summary
The web app now has a **real, working authentication system**:
- ✅ Public homepage for event browsing
- ✅ Registration with email verification
- ✅ Real login system (no mock users)
- ✅ Role-based route protection
- ✅ Session persistence
- ✅ Token management

Users can browse events without logging in, but must login to purchase or manage their tickets.
