# React TypeScript Fullstack App

This repository contains a full-stack Todo demo and a custom Copilot agent for scaffolding similar projects.

- `react-ts-fullstack-demo/`: existing React + Vite client and Express + MongoDB API, plus a Next.js + Tailwind client.
- `react-ts-fullstack-demo/mobile/cordova/`: Cordova shell for the static Next.js export.
- `react-ts-fullstack-demo/next-client/`: Next.js app configured for Capacitor.
- `.github/agents/React-App-Fullstack.agent.md`: project scaffolding agent instructions.

See [the demo README](react-ts-fullstack-demo/README.md) for installation, development, API, and mobile build instructions.

## Run the Next.js client

The runnable app is nested in `react-ts-fullstack-demo/`; this repository root does not have its own `package.json`. From this repository root:

```bash
npm install --prefix react-ts-fullstack-demo
npm install --prefix react-ts-fullstack-demo/next-client
npm run dev --prefix react-ts-fullstack-demo/next-client
```

Open http://localhost:3000. To start the Next.js client and API together, first ensure MongoDB is running, then use:

```bash
npm run dev:next --prefix react-ts-fullstack-demo
```

The Next.js client expects the API at `http://localhost:5001/api` by default. Copy `react-ts-fullstack-demo/next-client/.env.example` to `.env.local` in that folder if you want to configure `NEXT_PUBLIC_API_URL`; restart the dev server after changing it.
