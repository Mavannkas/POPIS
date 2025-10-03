# POPIS - Hackathon Boilerplate 🚀

A blazingly fast full-stack boilerplate for hackathons and rapid prototyping. Built with modern technologies and optimized for team collaboration.

## 🎯 Features

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: NestJS, TypeScript, RESTful API
- **Database**: SQLite with TypeORM (simple and portable)
- **Docker**: Full containerization with hot-reload for development
- **Team Ready**: Configured for 5-person team collaboration

## 📦 Project Structure

```
POPIS/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/       # Next.js App Router pages
│   │   ├── components/# React components (including shadcn/ui)
│   │   └── lib/       # Utility functions
│   └── Dockerfile     # Frontend production Dockerfile
│
├── backend/           # NestJS backend application
│   ├── src/
│   │   ├── items/     # Example CRUD module
│   │   └── main.ts    # Application entry point
│   └── Dockerfile     # Backend production Dockerfile
│
├── docker-compose.yml # Docker orchestration
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (recommended for team development)
- npm or yarn

### Option 1: Docker (Recommended for Teams)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd POPIS
   ```

2. **Start all services**
   ```bash
   docker-compose up
   ```

3. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

That's it! Both frontend and backend will auto-reload on code changes.

### Option 2: Local Development

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

The backend will run on http://localhost:3001

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will run on http://localhost:3000

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001`

### Endpoints

#### Health Check
```bash
GET /
# Returns: Backend status message
```

#### Items CRUD
```bash
# Get all items
GET /items

# Get single item
GET /items/:id

# Create item
POST /items
Content-Type: application/json
{
  "name": "Item name",
  "description": "Optional description"
}

# Delete item
DELETE /items/:id
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with Server Components
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: Beautiful, accessible component library
- **Lucide Icons**: Icon set

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe backend
- **TypeORM**: ORM for database operations
- **SQLite**: Lightweight, serverless database
- **Class Validator**: Request validation
- **CORS**: Cross-Origin Resource Sharing enabled

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in containers
docker-compose exec backend npm run test
docker-compose exec frontend npm run build
```

## 👥 Team Collaboration Workflow

### Development Workflow

1. **Clone and Setup**
   ```bash
   git clone <repo-url>
   cd POPIS
   docker-compose up
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Frontend changes: Edit files in `frontend/src/`
   - Backend changes: Edit files in `backend/src/`
   - Changes auto-reload in Docker

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Open PR on GitHub
   - Request team review
   - Merge after approval

### Git Conventions

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or tooling changes

## 📝 Development Tips

### Adding shadcn/ui Components

The project includes Button and Card components. To add more:

```bash
cd frontend
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add form
```

### Creating New Backend Modules

```bash
cd backend
npm run nest g module [module-name]
npm run nest g controller [module-name]
npm run nest g service [module-name]
```

### Database Management

The SQLite database file (`database.sqlite`) is created automatically in the `backend/` directory.

To reset the database:
```bash
# Stop containers
docker-compose down

# Remove database file
rm backend/database.sqlite

# Restart containers
docker-compose up
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
DB_TYPE=sqlite
DB_NAME=database.sqlite
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend
npm run test  # If you add testing framework
```

## 📦 Building for Production

### Using Docker
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Manual Build

#### Backend
```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # or :3001

# Kill process
kill -9 <PID>
```

### Docker Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Node Modules Issues
```bash
# Remove node_modules and reinstall
rm -rf frontend/node_modules backend/node_modules
docker-compose up --build
```

## 📄 License

MIT License - Feel free to use this boilerplate for your hackathon projects!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 💡 Tips for Hackathons

1. **Start with Docker** - Gets everyone on the same environment quickly
2. **Use the Items module as template** - Copy and modify for your needs
3. **Leverage shadcn/ui** - Pre-built, beautiful components
4. **Keep it simple** - SQLite means no database server to manage
5. **Hot reload is your friend** - Changes reflect immediately

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Docker logs: `docker-compose logs`
3. Open an issue on GitHub

---

**Happy Hacking! 🎉**

Built with ❤️ for rapid prototyping and hackathon success.