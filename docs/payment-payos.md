# payOS / VietQR Payment

The checkout supports:

- Cash on delivery
- Real payOS hosted checkout and VietQR

## Configure payOS

Create a payOS merchant account and copy the credentials from its payment channel settings:

```env
PAYMENT_PROVIDER=payos
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
FRONTEND_URL=http://localhost:3000
```

The backend uses the official `@payos/node` SDK. A transfer order is created first, then:

```http
POST /api/payments/payos/create
GET /api/payments/status/:orderId
POST /api/payments/payos/webhook
```

The create route returns a hosted `paymentUrl` and a rendered VietQR `qrCode`. Payment metadata is stored on the order, so status survives a backend restart.

## Configure the webhook

The webhook must be reachable from the internet. A localhost URL will not receive production callbacks.

Use the deployed backend URL:

```text
https://YOUR_BACKEND/api/payments/payos/webhook
```

Register that URL in the payOS dashboard. The backend verifies the complete webhook body with the official SDK, marks the order paid, and moves it to processing.

For local webhook testing, expose port `5000` with a tunnel and register the resulting HTTPS URL temporarily.

## Fallback behavior

If payOS credentials are missing or invalid, the backend returns an error and
the checkout should show a clear failure message. The project no longer uses a
bundled manual QR image fallback; online payment should redirect customers to
the hosted payOS checkout page.

## Safety

- Never put payOS secret keys in `NEXT_PUBLIC_*` variables.
- Never collect card or bank credentials in this application.
- Use HTTPS for deployed frontend, backend, return URL, and webhook URL.
- Use payOS sandbox/test credentials before accepting real money.

Official references:

- https://payos.vn/docs
- https://github.com/payOSHQ/payos-lib-node
