# Test Authentication API

## Quick Test Guide

### Prerequisites

1. Backend running on port 3000
2. MySQL database running
3. Frontend running on port 5173

### Test Sequence

#### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Registration initiated. Please verify OTP sent to your email.",
  "email": "test@example.com",
  "otp": "111111"
}
```

#### 2. Verify OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "111111"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "staff",
    "avatar": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "staff",
    "avatar": null,
    "lastLogin": "2026-04-20T22:57:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Get Profile (Protected Route)

```bash
# Replace YOUR_TOKEN with the token from login/verify response
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "role": "staff",
  "avatar": null,
  "status": "active",
  "lastLogin": "2026-04-20T22:57:00.000Z",
  "createdAt": "2026-04-20T22:55:00.000Z"
}
```

## Frontend Testing

### 1. Open Browser

Navigate to: `http://localhost:5173/auth/register`

### 2. Register

- Fill in the form
- Click "Finalize Registration"
- You should see a success toast

### 3. Verify OTP

- Enter: **111111** (six ones)
- Click "Verify & Continue"
- You should be redirected to dashboard

### 4. Logout & Login

- Logout from dashboard
- Go to `/auth/login`
- Enter your credentials
- You should be logged in and redirected to dashboard

## Common Issues

### Port 3000 in use

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### CORS errors

- Check backend CORS_ORIGIN in .env
- Should be: `http://localhost:5173`

### Token not working

- Check if token is stored in localStorage
- Open DevTools → Application → Local Storage
- Should see `token` and `user` keys

### OTP not working

- Make sure you're using exactly: **111111**
- Check that email matches registration email
- Check backend logs for errors

## Success Indicators

✅ Backend shows all auth routes mapped:

```
[RouterExplorer] Mapped {/api/v1/auth/register, POST} route
[RouterExplorer] Mapped {/api/v1/auth/verify-otp, POST} route
[RouterExplorer] Mapped {/api/v1/auth/login, POST} route
[RouterExplorer] Mapped {/api/v1/auth/profile, GET} route
```

✅ Frontend shows toast notifications
✅ User is redirected after successful auth
✅ Protected routes require authentication
✅ Token is stored in localStorage
✅ API requests include Authorization header
