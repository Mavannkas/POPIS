# POPIS - Full Stack App

A full-stack application with a Payload CMS backend and Expo React Native frontend.

## Project Structure

```
POPIS/
├── popis-be/          # Payload CMS 3.0 Backend (Next.js + SQLite)
├── popis-fe/          # Expo React Native Frontend
└── README.md
```

## Prerequisites

- Node.js 18.20.2 or higher (see `popis-be/package.json` for exact version)
- pnpm (for backend)
- npm (for frontend)
- Expo CLI (for mobile development)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd POPIS
```

### 2. Backend Setup

```bash
cd popis-be

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration (see Environment Variables section)
```

### 3. Frontend Setup

```bash
cd ../popis-fe

# Install dependencies
npm install
```

### 4. Run the Applications

#### Backend (Terminal 1)
```bash
cd popis-be
pnpm dev
```
- Admin panel: http://localhost:3000/admin
- API: http://localhost:3000/api

#### Frontend (Terminal 2)
```bash
cd popis-fe
npm start
```

Choose your platform:
- `a` - Android emulator/simulator
- `i` - iOS simulator
- `w` - Web browser

## Environment Variables

### Backend (.env)

Create a `.env` file in the `popis-be` directory:

```env
# Required: Random string for Payload CMS security
PAYLOAD_SECRET=your-super-secret-key-here

# Required: SQLite database URL
DATABASE_URI=file:./database.db
```

**Note:** The backend uses SQLite by default, so no additional database setup is required.

## Development Workflow

### Backend Development

```bash
cd popis-be

# Development server
pnpm dev

# Generate TypeScript types (after schema changes)
pnpm generate:types

# Run tests
pnpm test

# Linting
pnpm lint

# Build for production
pnpm build
```

### Frontend Development

```bash
cd popis-fe

# Start development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## Database

The backend uses SQLite as the database. The database file will be created automatically at `popis-be/database.db` when you first run the application.

## Testing

### Backend Tests

```bash
cd popis-be

# Run all tests
pnpm test

# Run integration tests only
pnpm test:int

# Run E2E tests
pnpm test:e2e
```

## API Documentation

Once the backend is running, you can access:

- **GraphQL Playground**: http://localhost:3000/api/graphql-playground
- **REST API**: http://localhost:3000/api/[endpoint]

## Admin Panel

Access the Payload CMS admin panel at http://localhost:3000/admin to manage your content.

### First Admin User

When you first visit the admin panel, you'll be prompted to create your first admin user.

## Deployment

### Backend Deployment

The backend can be deployed to:
- Payload Cloud
- Vercel
- Any Node.js hosting platform

### Frontend Deployment

The frontend can be deployed to:
- Expo Application Services (EAS)
- App Store / Google Play Store
- Web platforms

## Tech Stack

### Backend
- **Framework**: Next.js 15
- **CMS**: Payload CMS 3.0
- **Database**: SQLite
- **Language**: TypeScript
- **Package Manager**: pnpm

### Frontend
- **Framework**: Expo SDK 54
- **Platform**: React Native
- **Language**: TypeScript
- **Package Manager**: npm

## Troubleshooting

### Common Issues

1. **Port already in use**: Make sure ports 3000 (backend) and 8081 (frontend) are available
2. **Database connection failed**: Check your `DATABASE_URI` in the `.env` file
3. **Expo issues**: Try clearing Expo cache with `expo r -c`

### Reset Database

To reset the SQLite database:

```bash
cd popis-be
rm database.db
pnpm dev  # This will recreate the database
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test both backend and frontend
4. Submit a pull request

## License

MIT
