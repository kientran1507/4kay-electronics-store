# 4Kay Store Deployment Guide

This project is a monorepo with a Next.js frontend and an Express/MongoDB backend.

## Runtime Requirements

- Node.js 20.x or 22.x
- MongoDB Atlas or another hosted MongoDB instance
- payOS merchant credentials for online payment
- Gemini or OpenAI key for real AI responses

## Backend on Render

Recommended Render settings:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Required environment variables:

```env
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=https://your-vercel-domain.vercel.app
CORS_ORIGIN=https://your-vercel-domain.vercel.app
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
GEMINI_API_KEY=
```

Optional shipping configuration:

```env
FREE_SHIPPING_MIN=20000000
SHIPPING_SAME_CITY_FEE=25000
SHIPPING_NEARBY_FEE=35000
SHIPPING_NATIONAL_FEE=50000
SHIPPING_REMOTE_FEE=70000
```

After deployment, verify:

```text
https://your-render-service.onrender.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "4kay-store-api"
}
```

## Frontend on Vercel

Recommended Vercel settings:

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next`

Required environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api
```

Optional voice/avatar environment variables are listed in `frontend/.env.example`.

## MongoDB Setup

Use MongoDB Atlas for deployment:

1. Create a cluster.
2. Create a database user.
3. Allow the Render service IP or use `0.0.0.0/0` for a classroom demo.
4. Copy the connection string into `MONGODB_URI`.
5. Seed/import product data if the deployed database is empty.

Useful scripts:

```bash
npm run seed:vouchers --prefix backend
npm run enrich:products --prefix backend
npm run import:bestbuy --prefix backend
npm run import:amazon --prefix backend
```

## payOS Setup

1. Create a payOS merchant account.
2. Copy `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, and `PAYOS_CHECKSUM_KEY` into Render.
3. Set the webhook URL in payOS:

```text
https://your-render-service.onrender.com/api/payments/payos/webhook
```

4. Test checkout with a small order before using real payments.

## AI Setup

For Gemini:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-flash-latest
```

For OpenAI fallback:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Do not expose these keys in frontend `NEXT_PUBLIC_*` variables.

## Smoke Test Checklist

- Frontend homepage loads.
- Product list loads from deployed backend.
- Customer can sign in.
- Cart can quote shipping/voucher totals.
- COD checkout creates an order.
- Online checkout redirects to payOS.
- `/api/health` returns `200`.
- AI assistant answers a recommendation request.
