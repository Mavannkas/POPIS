# Setup Instructions - POPIS Backend

## 🚀 Quick Start (Hackathon Mode)

### 1. Install Dependencies
```bash
cd popis-be
pnpm install
```

### 2. Environment Variables
Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add:
```
PAYLOAD_SECRET=your-super-secret-key-change-this-in-production
DATABASE_URI=file:./db.sqlite
STREAM_API_KEY=your-stream-key
STREAM_API_SECRET=your-stream-secret
```

### 3. Get Stream Chat Credentials (5 minutes)
1. Go to https://getstream.io/chat/trial/
2. Sign up (free account)
3. Create new app
4. Copy **API Key** and **API Secret**
5. Paste into `.env` file

### 4. Run Development Server
```bash
pnpm dev
```

Server will start on: http://localhost:3000

### 5. Create First Super Admin
1. Go to http://localhost:3000/admin
2. Create account:
   - Email: admin@popis.pl
   - Password: (your choice)
   - First Name: Admin
   - Last Name: POPIS
   - Birth Date: any date (18+)
   - **Role: superadmin** (only first user can self-assign)

### 6. Verify Setup
After creating super admin, you should be able to:
- ✅ Access admin panel
- ✅ See collections: Users, Events, Applications, Certificates, Media
- ✅ Create test organization account
- ✅ Create test volunteer account

---

## 📋 API Endpoints Reference

### Public Endpoints (No Auth)
- `GET /api/events/available` - List published events
  - Query params: `category`, `city`, `minAge`, `search`

### Auth Endpoints (Built-in Payload)
- `POST /api/users/login` - Login
- `POST /api/users/logout` - Logout
- `GET /api/users/me` - Get current user
- `POST /api/users` - Register (public)

### Volunteer Endpoints (Auth Required)
- `POST /api/events/apply` - Apply to event
  - Body: `{ eventId, message }`
- `GET /api/my/applications` - My applications
- `GET /api/my/certificates` - My certificates

### Organization Endpoints (Auth Required)
- `GET /api/my/events` - My events
- `POST /api/applications/:id/accept` - Accept application
- `POST /api/applications/:id/complete` - Complete application
  - Body: `{ hoursWorked, notes }`
- `GET /api/stats/organization` - Organization stats

### Chat Endpoints (Auth Required)
- `GET /api/chat/token` - Get Stream Chat token
- `POST /api/chat/create-channel` - Create chat channel
  - Body: `{ applicationId }`

---

## 🎯 Testing the System

### Test Flow 1: Create Event and Apply
1. **As Organization:**
   - Create account (will need superadmin to verify)
   - Create event (published status)
   
2. **As Super Admin:**
   - Verify organization account
   
3. **As Volunteer:**
   - Register account
   - Browse events: `GET /api/events/available`
   - Apply to event: `POST /api/events/apply`
   
4. **As Organization:**
   - View applications
   - Accept application: `POST /api/applications/:id/accept`
   - Chat channel auto-created!
   
5. **As Volunteer:**
   - Get chat token: `GET /api/chat/token`
   - Connect to Stream Chat (mobile app)
   - Chat with organization

6. **As Organization:**
   - Complete volunteer work: `POST /api/applications/:id/complete`
   - Certificate auto-generated!

7. **As Volunteer:**
   - View certificate: `GET /api/my/certificates`

---

## 🏗️ Database Schema

### Collections:
1. **Users** - All user types (volunteer, organization, coordinator, superadmin)
2. **Events** - Volunteer opportunities
3. **Applications** - Volunteer applications to events
4. **Certificates** - Auto-generated certificates
5. **Media** - File uploads

### Relationships:
```
User (organization) -> Events -> Applications <- User (volunteer)
                                      |
                                      v
                                 Certificates
```

---

## 🔧 Troubleshooting

### "Chat service not configured"
- Check if `STREAM_API_KEY` and `STREAM_API_SECRET` are in `.env`
- Restart server after adding env vars

### "Unauthorized" errors
- Make sure you're sending Authorization header
- Login first: `POST /api/users/login`
- Use returned token in headers: `Authorization: Bearer <token>`

### Database locked
- Close all connections
- Delete `db.sqlite` and restart (will lose data)

### TypeScript errors
- Run: `pnpm generate:types`
- Restart IDE/editor

---

## 📱 Mobile App Integration

### Connect to Backend:
```typescript
// In React Native app
const API_URL = 'http://localhost:3000' // Change to production URL

// Login
const response = await fetch(`${API_URL}/api/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
const { token } = await response.json()

// Use token in subsequent requests
const headers = {
  'Authorization': `JWT ${token}`,
  'Content-Type': 'application/json'
}
```

### Connect Stream Chat:
```typescript
// Get token
const { token, apiKey, userId } = await fetch(`${API_URL}/api/chat/token`, {
  headers
}).then(r => r.json())

// Connect
import { StreamChat } from 'stream-chat'
const client = StreamChat.getInstance(apiKey)
await client.connectUser({ id: userId }, token)
```

---

## 🎉 You're Ready!

Backend is fully configured with:
- ✅ 4 user roles (superadmin, volunteer, organization, coordinator)
- ✅ Events management
- ✅ Application system
- ✅ Auto-generated certificates
- ✅ Stream Chat integration
- ✅ Stats and reporting
- ✅ Full access control

**Estimated setup time: 10-15 minutes**

Good luck at the hackathon! 🚀

