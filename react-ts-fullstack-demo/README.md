# React TypeScript Fullstack Demo

A full-stack Todo app with an existing Vite client, a Next.js + Tailwind CSS client, and an Express + MongoDB API. The Next.js client can be packaged for Android and iOS with Capacitor or Cordova.

## Prerequisites

- Node.js supported by the current Next.js release
- npm
- MongoDB (local, Docker, or Atlas)
- Android Studio for Android builds and Xcode for iOS builds

## Install and configure

```bash
npm install
npm install --prefix client
npm install --prefix next-client
npm install --prefix server
cp server/.env.example server/.env
cp next-client/.env.example next-client/.env.local
```

Do not overwrite existing `.env` files. Set a suitable `NEXT_PUBLIC_API_URL` in `next-client/.env.local` before building the mobile app. A physical device needs an API address it can reach; `localhost` on a phone or emulator is not the development computer. Set `CORS_ORIGINS` in `server/.env` to include the web or native app origin.

The server listens on port 5001 by default. Start MongoDB with `npm run db:up` when using Docker.

## Run

```bash
npm run dev       # Existing Vite client and API
npm run dev:next  # Next.js client and API
```

- Vite: http://localhost:5173
- Next.js: http://localhost:3000
- API health: http://localhost:5001/api/health

## Mobile

Next.js is configured for static export into `next-client/out`, which the mobile shells load as a local WebView app.

**Capacitor**

```bash
npm run cap:add:android --prefix next-client
npm run cap:add:ios --prefix next-client # Optional on macOS
npm run capacitor:sync
```

**Cordova**

```bash
npx cordova platform add android --project-dir mobile/cordova
npm run cordova:build
```

`cordova:build` builds Next.js, copies the static export into `mobile/cordova/www`, and builds installed Cordova platforms. Native builds require the relevant platform SDKs. Before a production mobile build, set `NEXT_PUBLIC_API_URL` to a deployed HTTPS API, allow the app's native origin in the API CORS configuration, and update Cordova's `<access>` origin in `mobile/cordova/config.xml` to the production API host.

## Build

```bash
npm run build       # API and Vite client
npm run build:next  # Static Next.js export
npm run capacitor:sync
npm run cordova:prepare
```

The API provides account registration/sign-in and authenticated todo CRUD. Vite and Next.js clients use the same API and database.
