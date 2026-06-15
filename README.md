# 4Kay Electronics Store

Full-stack electronics storefront with product browsing, customer and admin
accounts, cart and ordering flows, payments, and an AI shopping assistant.

## Project Structure

```text
frontend/   Next.js storefront and admin interface
backend/    Express API, MongoDB models, and recommendation services
docs/       Setup and feature documentation
```

## Requirements

- Node.js 20 LTS
- npm
- MongoDB Atlas or a local MongoDB server
- Gemini API key for AI-assisted preference extraction

## Quick Start

1. Copy `backend/.env.example` to `backend/.env`.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Add your MongoDB URI, JWT secret, and Gemini API key to `backend/.env`.
4. Install dependencies:

```bash
npm run install:all
```

5. Start the backend:

```bash
npm run dev:backend
```

6. In another terminal, start the frontend:

```bash
npm run dev:frontend
```

Open http://localhost:3000. The API runs at http://localhost:5000.

## Validation

```bash
npm test
npm run lint
npm run build
```

See [LAPTOP_SETUP.md](LAPTOP_SETUP.md) for detailed setup and the
[docs](docs) directory for feature-specific documentation.

## Security

Never commit `backend/.env`, `frontend/.env.local`, API keys, database
credentials, or payment credentials. Rotate any credential that has previously
appeared in source code or shared archives.
