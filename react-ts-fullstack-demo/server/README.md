# React + TypeScript + Node.js + MongoDB Demo

A small full-stack Todo app.

- **Client:** React + TypeScript, built with Vite
- **Server:** Node.js + Express + TypeScript
- **Database:** MongoDB, accessed with Mongoose

The app supports creating, listing, completing, and deleting todos, all stored in MongoDB.

## Project structure

```
.
├── package.json            Root scripts (run client and server together)
├── docker-compose.yml      Optional local MongoDB
├── client/                 React + TypeScript app (Vite)
│   ├── vite.config.ts      Proxies /api to the server
│   └── src/
│       ├── App.tsx
│       ├── types.ts
│       ├── api/todos.ts
│       └── components/Button.tsx
└── server/                 Express + Mongoose API
    ├── .env.example
    └── src/
        ├── index.ts
        ├── models/Todo.ts
        └── routes/todos.ts
```

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- MongoDB, using one of the options below

## Getting started

### 1. Install dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Set up environment variables

```bash
cp server/.env.example server/.env
```

Default values in `server/.env`:

```
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/react-ts-demo
CORS_ORIGINS=http://localhost:5173
```

> The server uses port **5001** because macOS uses port 5000 for AirPlay Receiver.

### UAT, QA, and production

Copy the matching template to create a local environment file. Update `MONGODB_URI` and `CORS_ORIGINS` for the target environment; do not commit the copied `.env.*` files.

```bash
cp server/.env.uat.example server/.env.uat
cp server/.env.qa.example server/.env.qa
cp server/.env.prod.example server/.env.prod
```

Set a unique token secret in each environment file. Generate one with `openssl rand -base64 32`; keep it private and do not reuse it across environments. `AUTH_TOKEN_SECRET` must be at least 32 characters. The same secret requirements apply when setting the variable in a deployment platform.

Run UAT or QA locally with `npm run dev:uat --prefix server` or `npm run dev:qa --prefix server`. For deployment, build and start the matching environment:

```bash
npm run build:uat --prefix server && npm run start:uat --prefix server
npm run build:qa --prefix server && npm run start:qa --prefix server
npm run build:prod --prefix server && npm run start:prod --prefix server
```

Each build writes to its own `server/dist/<environment>` directory. The compiled server code is the same for each build; environment variables are loaded at startup from the matching `.env` file (or supplied by the deployment platform).

The server reads its environment-specific file via `DOTENV_CONFIG_PATH`. Comma-separated origins are supported in `CORS_ORIGINS` when an environment has more than one frontend URL.

### 3. Start MongoDB

Choose one option.

**Option A: Docker**

```bash
npm run db:up
```

Stop it later with `npm run db:down`. Data is kept in a Docker volume.

**Option B: Homebrew (macOS)**

```bash
brew tap mongodb/brew
brew update
brew install mongodb-community
brew services start mongodb-community
```

**Option C: MongoDB Atlas (free cloud)**

Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), then paste its connection string into `server/.env` as `MONGODB_URI`.

### 4. Run the app

```bash
npm run dev
```

| Service | URL |
|---|---|
| Web app | http://localhost:5173 |
| API | http://localhost:5001/api/todos |
| Health check | http://localhost:5001/api/health |

## API

Base URL: `http://localhost:5001/api`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| GET | `/health` | Server and database status | none |
| POST | `/auth/register` | Create an account and sign in | `{ "email": "you@example.com", "password": "at-least-8-chars" }` |
| POST | `/auth/login` | Sign in and create a session | `{ "email": "you@example.com", "password": "..." }` |
| GET | `/auth/me` | Return the current account | none |
| POST | `/auth/logout` | Clear the current session | none |
| GET | `/todos` | List all todos, newest first | none |
| GET | `/todos/summary` | Total, completed, and pending counts | none |
| POST | `/todos` | Create a todo | `{ "text": "Buy milk" }` |
| POST | `/todos/bulk` | Create up to 100 todos and return per-item outcomes | `{ "todos": [{ "text": "Buy milk" }] }` |
| PATCH | `/todos/:id` | Update text and/or done | `{ "done": true }` |
| DELETE | `/todos/:id` | Delete a todo | none |

`GET /todos/summary` runs its independent count queries concurrently. `POST /todos/bulk` processes items independently and returns an indexed result for each; it responds with `201` when all succeed or `207` when one or more items fail.

Todo endpoints require a signed-in account, and each account can access only its own todos. Passwords are stored as bcrypt hashes; sessions use an HTTP-only cookie and expire after seven days. Login and registration share a limit of 10 attempts per IP every 15 minutes.

Todos created before authentication was added have no account owner, so they are not returned by the authenticated API. Back up or explicitly migrate any existing Todo records before deploying this schema change if that data needs to be retained.

Example:

```bash
curl -X POST http://localhost:5001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Learn MongoDB"}'
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the server and the client together |
| `npm run build` | Builds the server and the client |
| `npm run db:up` | Starts MongoDB with Docker |
| `npm run db:down` | Stops the MongoDB container |

Inside `client/` or `server/` you can also run `npm run dev`, `npm run build`, and (server only) `npm start`.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Access to localhost was denied" on port 5000 | macOS AirPlay Receiver uses 5000. Use port 5001 as configured here |
| Health check shows `"db":"disconnected"` | MongoDB isn't running, or `MONGODB_URI` is wrong |
| `Cannot connect to the Docker daemon` | Open Docker Desktop and wait until it is running |
| `port 27017 already in use` | Another MongoDB is running. Stop it with `brew services stop mongodb-community` |
| `Cannot GET /` at http://localhost:5001 | Expected. The API lives under `/api` |
| Todos fail to load in the browser | Make sure the server is running and the Vite proxy points to port 5001 |

## Publishing to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create <repo-name> --public --source=. --remote=origin --push
```

`server/.env` is listed in `.gitignore`, so your database credentials are not uploaded.

## Ideas for next steps

- Add edit-in-place for todo text
- Add user authentication with JWT
- Add input validation with Zod
- Add tests with Vitest and Supertest
- Deploy the API and client (for example Render and Vercel) with MongoDB Atlas
