# 4Kay Store Database Structure

MongoDB collections are defined by Mongoose models in `backend/models`.
MongoDB adds `_id`; schemas with timestamps also add `createdAt` and `updatedAt`.

## Collections

| Collection | Purpose |
| --- | --- |
| `products` | Product catalog and recommendation data |
| `customers` | Customer accounts |
| `admins` | Administrator accounts |
| `carts` | Active shopping carts |
| `orders` | Orders, shipping totals, and payment state |
| `vouchers` | Discount rules |

## Products

This is the complete compact product shape:

```json
{
  "name": "MacBook Air M3",
  "description": "Lightweight laptop for study and office work.",
  "descriptionVi": "Laptop mỏng nhẹ cho học tập và văn phòng.",
  "price": 24990000,
  "stock": 20,
  "image": "https://example.com/macbook-air-m3.jpg",
  "images": [],
  "category": "laptop",
  "brand": "Apple",
  "specs": {
    "cpu": "Apple M3",
    "gpu": "Integrated GPU",
    "ram": "8GB",
    "storage": "256GB SSD",
    "screenSize": "13.6 inch",
    "battery": "Up to 18 hours",
    "camera": "1080p",
    "weight": "1.24 kg",
    "operatingSystem": "macOS"
  },
  "useCases": ["study", "office", "portability", "battery"],
  "highlights": {
    "en": ["Lightweight", "Long battery life"],
    "vi": ["Mỏng nhẹ", "Pin lâu"]
  },
  "tradeoffs": {
    "en": ["Limited ports"],
    "vi": ["Ít cổng kết nối"]
  },
  "rating": 4.7,
  "reviewCount": 180,
  "warranty": "12 months"
}
```

Required: `name`, `description`, `price`, `stock`, `category`.

Category keys: `phone`, `laptop`, `tablet`, `audio`, `accessory`, `keyboard`,
`mouse`, `monitor`, `storage`, `gaming`.

Use-case keys: `study`, `office`, `gaming`, `programming`, `editing`, `camera`,
`battery`, `portability`, `durability`, `value`.

English is the default product copy. Vietnamese copy is optional and falls back
to English. Product facts, categories, specs, and use cases are stored once.

To simplify an older product collection:

```powershell
cd backend
npm run migrate:simplify-products
```

The migration creates a timestamped backup collection before removing old fields.

## Customers

```json
{
  "name": "Tran Trung Kien",
  "email": "customer@example.com",
  "password": "bcrypt-hash",
  "phone": "0888011903",
  "address": "118 Nguyen Xien, Ho Chi Minh City"
}
```

Required: `name`, unique `email`, `password`. Never import plain-text passwords
directly into MongoDB; use the API so the model hashes them.

## Admins

```json
{
  "name": "Store Admin",
  "email": "admin@example.com",
  "password": "bcrypt-hash",
  "phone": "0900000000"
}
```

Required: `name`, unique `email`, `password`.

## Carts

```json
{
  "userId": "CUSTOMER_OBJECT_ID",
  "items": [
    { "productId": "PRODUCT_OBJECT_ID", "quantity": 2, "price": 24990000 }
  ],
  "totalPrice": 49980000
}
```

`userId` references `customers`; each `productId` references `products`.

## Orders

```json
{
  "userId": "CUSTOMER_OBJECT_ID",
  "items": [
    { "productId": "PRODUCT_OBJECT_ID", "quantity": 1, "price": 24990000 }
  ],
  "subtotal": 24990000,
  "discountAmount": 1000000,
  "voucherCode": "WELCOME100",
  "shippingFee": 30000,
  "shippingZone": "same_city",
  "shippingLabel": "Ho Chi Minh City",
  "totalPrice": 24020000,
  "status": "Chờ thanh toán",
  "shippingAddress": "118 Nguyen Xien, Ho Chi Minh City",
  "paymentMethod": "Chuyển khoản",
  "paymentStatus": "pending",
  "paymentProvider": "payos",
  "paymentOrderCode": 123456,
  "paymentLinkId": "payos-link-id",
  "paymentUrl": "https://pay.payos.vn/..."
}
```

Do not calculate order totals in imported data. Use the checkout API so voucher,
shipping, inventory, and PayOS state remain consistent.

## Vouchers

```json
{
  "code": "WELCOME10",
  "description": "10% off for new customers",
  "type": "percentage",
  "value": 10,
  "maxDiscount": 1000000,
  "minOrderValue": 5000000,
  "usageLimit": 500,
  "usedCount": 0,
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2026-12-31T23:59:59.999Z",
  "active": true,
  "appliesToCategories": ["laptop"],
  "appliesToProducts": []
}
```

`type` is `percentage` or `fixed`. Empty category/product arrays mean the
voucher applies to the whole catalog.

## Data Rules

- Prices are integer VND amounts.
- References must be valid MongoDB ObjectIds from the target database.
- Category values in products and vouchers must use the same canonical keys.
- `stock`, quantities, review counts, and voucher counters cannot be negative.
- Product display copy may be bilingual; operational order/payment values stay canonical.
- Keep API keys, MongoDB credentials, and payment secrets in `backend/.env`, never in documents.
