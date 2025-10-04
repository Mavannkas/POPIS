# POPIS - 24h Hackathon Boilerplate 🚀

A **minimal, fast** full-stack boilerplate for 24-hour hackathons. Get from zero to coding in 2 minutes.

## Stack

**Frontend:** React Native + Expo + TypeScript  
**Backend:** NestJS + TypeScript + SQLite + TypeORM  
**Dev:** Docker Compose with hot reload

## Quick Start

```bash
git clone <repo-url>
cd POPIS
./start.sh
```

**That's it!** 

- Frontend: http://localhost:19000 (Expo DevTools)
- Backend: http://localhost:3001

## Project Structure

```
POPIS/
├── frontend/          # React Native Expo app
│   ├── App.tsx        # Main app component
│   └── assets/        # Images and other assets
│
└── backend/           # NestJS API
    └── src/
        ├── items/     # Example CRUD
        └── main.ts    # Entry point
```

## Available Commands

```bash
make dev      # Start everything
make stop     # Stop containers
make logs     # View logs
make clean    # Reset everything
```

Or use Docker directly:
```bash
docker-compose up        # Start
docker-compose down      # Stop
docker-compose logs -f   # Logs
```

## Adding Features

### Frontend
- Edit `App.tsx` to modify the main screen
- Add components in the root directory or create a `components/` folder
- Use React Native built-in components or add libraries like React Navigation

### Backend
- Create modules in `backend/src/`
- See `items/` folder for CRUD example
- Database auto-creates, no setup needed

## API Example

```typescript
// GET http://localhost:3001/items
// POST http://localhost:3001/items
{
  "name": "My Item",
  "description": "Optional description"
}
```

## Tips for Fast Iteration

1. **Hot reload is enabled** - Just save and see changes
2. **SQLite = no database setup** - It just works
3. **TypeScript everywhere** - Catch errors early
4. **Example CRUD included** - Copy and modify

## Troubleshooting

**Port already in use?**
```bash
make clean
make dev
```

**Docker issues?**
```bash
docker-compose down -v
docker-compose up --build
```

**Need to reset database?**
```bash
rm backend/database.sqlite
make dev
```

## What's Included

✅ Working example with frontend-backend communication  
✅ CRUD operations (Create, Read, Delete)  
✅ TypeScript for type safety  
✅ Hot reload on file changes  
✅ No configuration needed  

## Focus on Building

This boilerplate removes all setup friction. No tests to write, no complex configs, no production concerns. Just start building your MVP!

**Happy Hacking! 🎉**