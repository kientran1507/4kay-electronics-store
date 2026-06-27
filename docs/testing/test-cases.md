# 4Kay Store Testing Plan

This document lists the main test cases for the graduation report. Automated backend tests live in `backend/tests`.

## Test Scope

The highest-risk features are checkout pricing, order creation, payment, authentication, and the AI recommendation assistant.

## Testing Techniques

- Equivalence partitioning: valid and invalid inputs such as voucher codes, auth tokens, product categories, and AI requests.
- Boundary value analysis: shipping thresholds, voucher minimum order values, quantity limits, and discount caps.
- Decision table testing: combinations of payment method, voucher, shipping zone, and cart total.
- Scenario testing: realistic customer and admin flows.

## Core Test Cases

| ID | Feature | Technique | Input | Expected Result | Automated |
|---|---|---|---|---|---|
| TC-001 | Shipping fee | Equivalence | Ho Chi Minh address below free threshold | Same-city fee is used | Yes |
| TC-002 | Shipping fee | Equivalence | Ha Noi/Da Nang address below free threshold | National fee is used | Yes |
| TC-003 | Shipping fee | Boundary | Subtotal exactly at `FREE_SHIPPING_MIN` | Shipping fee is `0` | Yes |
| TC-004 | Voucher | Boundary | Percentage voucher with max discount | Discount does not exceed max | Yes |
| TC-005 | Voucher | Boundary | Fixed voucher larger than subtotal | Discount does not exceed subtotal | Yes |
| TC-006 | Voucher | Equivalence | Expired voucher | Voucher is rejected | Yes |
| TC-007 | Voucher | Equivalence | Cart below voucher minimum | Voucher is rejected | Yes |
| TC-008 | Voucher | Equivalence | Category-limited voucher on wrong category | Voucher is rejected | Yes |
| TC-009 | Auth | Negative | Missing bearer token | Request is rejected with `401` | Yes |
| TC-010 | Auth | Negative | Malformed bearer token | Request is rejected with `401` | Yes |
| TC-011 | Admin auth | Role check | Customer token on admin route | Request is rejected with `403` | Yes |
| TC-012 | Payment | Equivalence | payOS `PAID` status | Local status becomes `paid` | Yes |
| TC-013 | Payment | Equivalence | payOS cancelled/expired status | Local status becomes `cancelled` | Yes |
| TC-014 | AI assistant | Scenario | Greeting | General helpful reply, no random recommendation | Yes |
| TC-015 | AI assistant | Scenario | Vague laptop request | Ask one follow-up question | Yes |
| TC-016 | AI assistant | Scenario | Phone under budget with camera/battery | Extract category, budget, use cases | Yes |

## Manual End-to-End Test Cases

| ID | Scenario | Steps | Expected Result |
|---|---|---|---|
| ME-001 | Customer checkout with COD | Sign in, add product, enter shipping address, choose COD, place order | Order appears in My Orders with processing status |
| ME-002 | Customer checkout with payOS | Sign in, add product, choose online payment | Browser redirects to payOS checkout |
| ME-003 | Voucher flow | Enter valid voucher in cart | Discount, shipping, and final total update correctly |
| ME-004 | AI recommendation | Ask: `I need a laptop under 20 million VND for programming and light gaming` | Assistant recommends products with reasons and trade-offs |
| ME-005 | Admin order update | Admin signs in and changes order status | Customer order status updates |

## Commands

Run backend tests:

```bash
npm test --prefix backend
```

Run frontend type checking:

```bash
npm run typecheck --prefix frontend
```

Run frontend build:

```bash
npm run build --prefix frontend
```
