# 4Kay Store Laptop Setup

## Requirements

- Node.js 20 LTS
- npm
- MongoDB Atlas access or a local MongoDB server

## 1. Configure The Backend

From the repository root:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set at least:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

Payment credentials are optional. Without PayOS credentials, checkout uses the
included manual bank QR fallback.

Install and run the backend:

```bash
npm install --prefix backend
npm run dev:backend
```

The backend runs at `http://localhost:5000`.

## 2. Configure The Frontend

Open a second terminal from the repository root:

```bash
cp frontend/.env.example frontend/.env.local
npm install --prefix frontend
npm run dev:frontend
```

The storefront runs at `http://localhost:3000`.

## 3. Verify

- Open `http://localhost:3000`.
- Confirm products load.
- Open the AI assistant and send: `Help me choose the right device`.
- Add a product to the cart and open checkout.

Do not commit or share `.env` or `.env.local` files.
