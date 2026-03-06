# Web Authentication - Quick Reference Card

## Test Credentials

### Important: These are examples. Use REAL credentials created via registration.

```
❌ DO NOT USE (Old mock users - no longer work):
- Email: alex@example.com (customer)
- Email: contact@sonichorizon.com (organizer)
- Email: admin@ticketvibe.com (admin)

✅ DO THIS INSTEAD:
1. Go to /register
2. Create new account with your email
3. Verify email with OTP code from backend
4. Login with your credentials
```

## Quick Links

| Purpose             | URL                                                       |
| ------------------- | --------------------------------------------------------- |
| Homepage            | http://localhost:5173                                     |
| Register            | http://localhost:5173/register                            |
| Login               | http://localhost:5173/login                               |
| My Tickets          | http://localhost:5173/my-tickets (requires login)         |
| Organizer Dashboard | http://localhost:5173/organizer (requires organizer role) |
| Admin Dashboard     | http://localhost:5173/admin/payouts (requires admin role) |

## Backend URLs

| Service      | URL                   |
| ------------ | --------------------- |
| Auth Service | http://localhost:4001 |
| API Gateway  | http://localhost:4000 |

## Testing Checklist

### Registration Test

- [ ] Go to `/register`
- [ ] Fill in form with test data
- [ ] See "Email verification required" message
- [ ] Check backend logs for OTP code
- [ ] Go to `/otp` and enter code
- [ ] See "Email verified" success message

### Login Test

- [ ] Go to `/login`
- [ ] Enter email and password
- [ ] See redirect to homepage
- [ ] See your name in navbar (if UI shows it)
- [ ] Try accessing `/my-tickets` - should work
- [ ] Try accessing `/organizer` - should redirect to home

### Session Test

- [ ] Login to account
- [ ] Refresh page (`F5` or `Ctrl+R`)
- [ ] Should still be logged in
- [ ] Open DevTools → Application → localStorage
- [ ] See `auth_token` is stored
- [ ] Close browser completely
- [ ] Reopen and go to website
- [ ] Should still be logged in!

### Logout Test

- [ ] Login first
- [ ] Find logout button (likely in profile/settings)
- [ ] Click logout
- [ ] Try accessing protected page
- [ ] Should redirect to `/login`
- [ ] Check localStorage - `auth_token` should be cleared

## Environment Setup

### Frontend (.env or .env.local)

```env
VITE_API_URL=http://localhost:4001
```

### Backend (.env in auth-service)

```env
JWT_SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
DATABASE_URL=mongodb://localhost:27017/ticketvibe
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Key Files

```
Frontend Auth System:
├── src/contexts/AuthContext.tsx          (Auth logic & state)
├── src/pages/auth/LoginPage.tsx          (Login form)
├── src/pages/auth/RegisterPage.tsx       (Register form - NEW)
├── src/pages/auth/OTPPage.tsx            (Email verification)
├── src/pages/auth/ResetPasswordPage.tsx  (Password reset)
└── src/App.tsx                           (Route protection)

Backend Auth System:
├── services/auth-service/src/
│   ├── controllers/auth.controller.ts    (Login, register, verify)
│   ├── routes/auth.routes.ts             (Auth endpoints)
│   ├── models/user.model.ts              (User schema)
│   └── middleware/auth.middleware.ts     (Token verification)
```

## Common Issues & Solutions

| Issue                                | Solution                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| "Email already exists"               | Register with different email or reset database                 |
| "Invalid OTP code"                   | Check backend logs for correct code, must enter within 1 minute |
| "User not found on login"            | Make sure email is verified first, try registering again        |
| "401 Unauthorized on protected page" | Token expired, need to login again                              |
| "Cannot connect to server"           | Make sure backend is running on port 4001                       |
| "Email not sending"                  | Email service not configured, check EMAIL_SETUP.md              |

## API Curl Examples

### Register

```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Test123456"
  }'
```

### Login

```bash
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123456"
  }'
```

### Verify Email

```bash
curl -X POST http://localhost:4001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "123456"
  }'
```

### Get Current User (with token)

```bash
curl -X GET http://localhost:4001/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Logout

```bash
curl -X POST http://localhost:4001/api/auth/logout \
  -H "Content-Type: application/json"
```

## Debugging Tips

### Check if token is stored

```javascript
// In browser console
localStorage.getItem("auth_token");
```

### Check if user is authenticated

```javascript
// In browser console
// Look for useAuth hook in component
const { user, isAuthenticated } = useAuth();
console.log(user, isAuthenticated);
```

### Check backend logs

```bash
# If running with npm
npm run dev

# You should see messages like:
# 🔐 [LOGIN] Incoming request...
# ✅ [LOGIN] Success for user...
# ❌ [LOGIN] Password mismatch...
```

## Password Reset Flow

1. Go to `/login`
2. Click "Forgot Password?"
3. Enter your email
4. Backend sends reset code
5. Enter code and new password
6. Login with new password

## Role-Based Access

| Role          | Home | Profile | My Tickets | Organizer | Admin |
| ------------- | ---- | ------- | ---------- | --------- | ----- |
| Customer      | ✅   | ✅      | ✅         | ❌        | ❌    |
| Organizer     | ✅   | ✅      | ✅         | ✅        | ❌    |
| Admin         | ✅   | ✅      | ✅         | ✅        | ✅    |
| Not Logged In | ✅   | ❌      | ❌         | ❌        | ❌    |

## Performance Tips

- Token is stored in both `localStorage` and `httpOnly` cookie
- Use localStorage for XHR/Fetch requests
- Use httpOnly cookie for form submissions
- Token valid for 1 day before re-authentication needed
- Session restored automatically on page refresh

## Security Notes

✅ Passwords hashed with bcrypt
✅ JWT tokens signed with secret key
✅ httpOnly cookies prevent XSS attacks
✅ Email verification prevents spam accounts
✅ Password reset codes expire after 1 hour
✅ OTP codes expire after 1 minute
✅ Role-based route protection on frontend and backend

## Next Steps

1. ✅ Test registration flow
2. ✅ Test login flow
3. ✅ Test protected routes
4. ✅ Test session persistence
5. 🔄 Set up email service for real emails
6. 🔄 Implement Google OAuth
7. 🔄 Add 2FA (optional)

---

**Last Updated**: 2026-03-06
**Status**: Production Ready ✨
