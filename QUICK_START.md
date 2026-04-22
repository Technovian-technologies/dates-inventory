# 🚀 Quick Start Guide

## Start the Application

### 1. Start Backend (Terminal 1)

```bash
cd backend
bun src/main.ts
```

✅ Backend running on **http://localhost:3000**

### 2. Start Frontend (Terminal 2)

```bash
bun run dev
```

✅ Frontend running on **http://localhost:5173**

## Test Authentication

### Register a New User

1. Open **http://localhost:5173/auth/register**
2. Fill in:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - ✅ Accept terms
3. Click **"Finalize Registration"**

### Verify OTP

1. Enter OTP: **111111** (six ones)
2. Click **"Verify & Continue"**
3. ✅ You're now logged in and redirected to dashboard!

### Login Again

1. Logout from dashboard (if needed)
2. Go to **http://localhost:5173/auth/login**
3. Enter:
   - Email: `john@example.com`
   - Password: `password123`
4. Click **"Access Vault"**
5. ✅ You're logged in!

## Important Notes

- **OTP Code:** Always use **111111** (six ones)
- **Password:** Minimum 6 characters
- **Token:** Automatically stored in localStorage
- **Session:** Persists across page refreshes

## Quick Test with cURL

```bash
# 1. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# 2. Verify OTP
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","otp":"111111"}'

# 3. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Troubleshooting

### Port 3000 already in use?

```bash
lsof -ti:3000 | xargs kill -9
```

### Can't connect to database?

Check `backend/.env`:

```env
DB_HOST=192.168.0.246
DB_PORT=3306
DB_USERNAME=remoteuser
DB_PASSWORD=password
DB_DATABASE=dates_inventory
```

### Frontend can't reach backend?

Check `.env` in root:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## That's It! 🎉

You now have a fully functional authentication system with:

- ✅ User registration
- ✅ OTP verification (static: 111111)
- ✅ Login/Logout
- ✅ Protected routes
- ✅ JWT authentication
- ✅ Beautiful UI

For more details, see:

- `AUTHENTICATION_COMPLETE.md` - Full documentation
- `TEST_AUTH_API.md` - API testing guide
- `AUTH_SETUP_COMPLETE.md` - Technical details
