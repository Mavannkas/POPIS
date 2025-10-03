# Contributing to POPIS

Thank you for contributing to the POPIS Hackathon Boilerplate! This guide will help you get started.

## Quick Start for New Team Members

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd POPIS
   ```

2. **Start development with Docker** (Recommended)
   ```bash
   docker-compose up
   ```
   
   Or use the Makefile:
   ```bash
   make dev
   ```

3. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Development Workflow

### Creating a New Feature

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
   Branch naming conventions:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation changes
   - `refactor/` - Code refactoring

3. **Make your changes**
   - Frontend: Edit files in `frontend/src/`
   - Backend: Edit files in `backend/src/`
   - Docker watches for changes and auto-reloads

4. **Test your changes**
   - Access the apps at http://localhost:3000 and http://localhost:3001
   - Check Docker logs: `docker-compose logs -f`

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add user authentication"
   ```

6. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to GitHub and create a PR
   - Request review from team members
   - Merge after approval

## Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or tooling changes

Examples:
```bash
git commit -m "feat: add user registration endpoint"
git commit -m "fix: resolve database connection issue"
git commit -m "docs: update API documentation"
```

## Code Style

### Frontend (TypeScript/React)

- Use functional components with hooks
- Use TypeScript for type safety
- Follow React naming conventions
- Use shadcn/ui components when available

### Backend (NestJS)

- Follow NestJS best practices
- Use DTOs for validation
- Use TypeORM entities for database models
- Keep controllers thin, services fat

## Testing

### Backend Tests

```bash
# Run all tests
cd backend && npm run test

# Run tests in watch mode
cd backend && npm run test:watch

# Generate coverage report
cd backend && npm run test:cov
```

### Frontend Tests

```bash
cd frontend && npm run test
```

## Useful Commands

### Using Makefile

```bash
make help          # Show all available commands
make dev           # Start development environment
make down          # Stop all containers
make logs          # Show all logs
make clean         # Clean up everything
```

### Manual Commands

```bash
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild containers
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Access backend shell
docker-compose exec backend sh

# Access frontend shell
docker-compose exec frontend sh
```

## Adding New Dependencies

### Backend Dependencies

```bash
# Install new package
docker-compose exec backend npm install <package-name>

# Or rebuild container
docker-compose up --build backend
```

### Frontend Dependencies

```bash
# Install new package
docker-compose exec frontend npm install <package-name>

# Or rebuild container
docker-compose up --build frontend
```

## Database Management

### Resetting the Database

```bash
# Stop containers
docker-compose down

# Remove database file
rm backend/database.sqlite

# Restart containers (database will be recreated)
docker-compose up
```

### Viewing Database

SQLite browser tools:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Viewer VS Code Extension](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer)

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

### Docker Build Issues

```bash
# Remove all containers and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Node Modules Issues

```bash
# Remove node_modules in containers
docker-compose down
docker volume prune -f
docker-compose up --build
```

## Best Practices

1. **Always pull before creating a new branch**
2. **Keep commits small and focused**
3. **Write descriptive commit messages**
4. **Test your changes before committing**
5. **Don't commit sensitive data** (passwords, API keys, etc.)
6. **Update documentation** when adding features
7. **Ask for help** if you're stuck!

## Getting Help

- Check the main [README.md](README.md) for setup instructions
- Review Docker logs: `docker-compose logs`
- Ask team members for help
- Create an issue on GitHub for bugs

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Happy Coding! 🚀
