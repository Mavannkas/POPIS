# Environment Variables Template

## Quick Setup for Hackathon

Create a `.env` file in `popis-be/` directory with these values:

```bash
# Payload Secret (required) - Generate with: openssl rand -base64 32
PAYLOAD_SECRET=change-this-to-a-random-secret-key-at-least-32-characters

# Database (required)
DATABASE_URI=file:./db.sqlite

# Stream Chat (required for chat functionality)
# Get these from: https://getstream.io/dashboard
STREAM_API_KEY=your_stream_api_key_here
STREAM_API_SECRET=your_stream_api_secret_here

# Node Environment (optional)
NODE_ENV=development
```

## How to Get Stream Chat Credentials (2 minutes):

1. Go to https://getstream.io/chat/trial/
2. Sign up with email (free account)
3. Create new app (name: "POPIS" or anything)
4. In dashboard, find:
   - **App Key** → Copy to `STREAM_API_KEY`
   - **App Secret** → Copy to `STREAM_API_SECRET`
5. Done! Free tier includes 25 MAU (monthly active users)

## Quick Start Commands:

```bash
# 1. Copy this template
echo "PAYLOAD_SECRET=$(openssl rand -base64 32)
DATABASE_URI=file:./db.sqlite
STREAM_API_KEY=
STREAM_API_SECRET=
NODE_ENV=development" > .env

# 2. Edit .env and add your Stream credentials
nano .env  # or code .env

# 3. Install & run
pnpm install
pnpm dev

# 4. Open http://localhost:3000/admin and create first superadmin account
```

## Testing Without Stream Chat:

If you want to test without chat first (skip for now):
- Leave `STREAM_API_KEY` and `STREAM_API_SECRET` empty
- All endpoints except `/api/chat/*` will work
- Chat creation will fail gracefully (logged but won't block)
- Add credentials later when ready for chat testing

## Production Notes:

For production deployment:
- Use strong `PAYLOAD_SECRET` (32+ chars)
- Use PostgreSQL instead of SQLite: `DATABASE_URI=postgresql://...`
- Add these env vars to your hosting platform (Vercel, Railway, etc.)
- Stream Chat free tier supports 25 MAU, upgrade for more

