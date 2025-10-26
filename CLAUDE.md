# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Protothought is a crowdsourced criticism platform where users submit ideas and vote on others' ideas. It's a full-stack application with:
- React frontend (client/)
- Express.js backend (server/)
- PostgreSQL database
- Docker Compose for orchestration

## Development Commands

### Running the Application

**Via Docker (Recommended):**
```bash
docker-compose up
```
- Frontend: http://localhost:80
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

**Local Development:**

Frontend (from `client/`):
```bash
npm start          # Start dev server on port 3000
npm test          # Run React tests
npm run build     # Production build
```

Backend (from `server/`):
```bash
# Set environment variables or use .env file
node index.js     # Start server on port 5000
npm test          # Run Jest tests
```

### Database

The database connection is configured via environment variables in `.env`:
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DB_HOST` (defaults to 'db' for Docker)

Sequelize auto-syncs models on startup (`sequelize.sync()` in server/index.js:20).

## Architecture

### Backend Structure (server/)

**Models (Sequelize ORM):**
- `User`: username, password (bcrypt hashed), crits (currency)
- `Idea`: ideaDescription, ideaCrits, userId (foreign key)
- `Vote`: userId, ideaId, isLike (boolean)

**API Routes (all mounted under `/api`):**

Auth routes (authRoutes.js):
- POST `/api/signup` - User registration
- POST `/api/login` - User authentication

Idea routes (ideaRoutes.js):
- POST `/api/createidea` - Create new idea
- POST `/api/deleteidea` - Delete idea
- POST `/api/gettopideaforuser` - Get highest crit idea
- POST `/api/userboostscrit` - User spends crits to boost idea
- POST `/api/getIdeasWithVotesFromUser` - Get user's ideas with vote counts

Vote routes (voteRoutes.js):
- POST `/api/createvote` - Vote on idea (like/dislike)
- POST `/api/deletevote` - Remove vote
- POST `/api/getvote` - Get specific vote

**Controllers:**
- Request handlers in `controllers/` directory
- Business logic for user auth, idea management, and voting
- Note: `ideaController.js:712` contains the logic for marking ideas as failed

### Frontend Structure (client/src/)

**Routing (App.js):**
- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/ideas` - Ideas browsing (requires login state)

**Components:**
- `home.jsx` - Main landing page with idea submission
- `ideas.jsx` - Browse and vote on ideas
- `login.jsx` - User login form
- `signup.jsx` - User registration form
- `testing.jsx` - Testing utilities

**API Integration:**
- Client uses axios for API calls
- Backend proxied via `"proxy": "http://backend:5000"` in package.json
- Authentication state managed in App.js via `isLoggedIn` and `userData`

### Key Architectural Patterns

**Database Relationships:**
- User hasMany Ideas and Votes
- Idea belongsTo User, hasMany Votes
- Vote belongsTo User and Idea
- Foreign keys use cascade delete

**Crit System:**
- Users earn "crits" (currency) for participation
- Ideas have "ideaCrits" that determine ranking
- Users can boost their own ideas by spending crits (userBoostsCrits endpoint)
- Top ideas retrieved by ordering on ideaCrits DESC

**Vote Aggregation:**
- `getIdeasWithVotesFromUser` uses Sequelize aggregation to count likes/dislikes
- Returns ideas with `likeCount` and `dislikeCount` computed fields
- Uses GROUP BY and COALESCE for SQL aggregation

## Common Development Patterns

### Adding New API Endpoints

1. Define Sequelize model in `server/models/` if needed
2. Create controller function in `server/controllers/`
3. Add route in `server/routes/`
4. Import and mount route in `server/index.js`

### Making API Calls from Frontend

```javascript
import axios from 'axios';

const response = await axios.post('/api/endpoint', { data });
```

The proxy in client/package.json routes `/api` requests to backend.

## Testing

Backend tests configured with Jest (`npm test` in server/).
Frontend tests use React Testing Library (`npm test` in client/).

Test coverage areas noted in server/BACKENDREADME.md:
- Idea controller: create, destroy, get next unvoted, boost
- Vote controller: create, destroy vote operations
