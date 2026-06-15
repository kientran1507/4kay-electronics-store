# 4Kay Store Safe Refactor Plan

Plan date: June 12, 2026

This plan is based on the current Next.js, Express, MongoDB, and Mongoose implementation documented in `docs/project-audit.md`. It intentionally avoids a rewrite.

## 1. What Can Be Safely Refactored

The safest work is incremental and contract-first:

1. Secure configuration and response serialization.
2. Correct mismatched frontend/backend API contracts.
3. Add validation around existing Mongoose models.
4. Enrich existing product documents without changing required fields.
5. Improve the existing AI services and avatar wiring.
6. Complete authentication features using the current Customer model.
7. Improve current pages while keeping their routes.
8. Replace stale documentation after behavior is verified.

The following should not be replaced:

- MongoDB
- Existing Mongoose collection structure
- Express route architecture
- Current Next.js App Router structure
- Existing 4Kay logo
- Existing assistant portrait and VRM model
- Existing product, cart, order, and authentication APIs where repair is sufficient

## 2. Files That Need Changes

### Phase A: Security and API Contract Repair

Backend:

- `backend/db.js`
- `backend/.env` and root `.env.example`
- `backend/controllers/customerController.js`
- `backend/routes/customerRoutes.js`
- `backend/controllers/productController.js`
- `backend/routes/productRoutes.js`
- `backend/controllers/cartController.js`
- `backend/controllers/orderController.js`
- `backend/routes/paymentRoutes.js`
- `backend/middleware/authMiddleware.js`

Frontend:

- `frontend/lib/apiCalls.ts`
- `frontend/types.ts`
- `frontend/app/utils/authContext.tsx`
- `frontend/hooks/use-cart.tsx`

Add focused tests for route contracts and service functions before broad UI work.

### Phase B: Product Data and Import

- `backend/models/productModel.js`
- `backend/controllers/productController.js`
- `backend/scripts/enrichProducts.js`
- `backend/scripts/importBestBuyProducts.js`
- `backend/scripts/importAmazonProducts.js`
- `backend/services/productImport`
- Admin product create/edit forms

Changes should primarily improve validation, field mapping, dry-run support, and admin visibility. The current model already contains the required recommendation fields.

### Phase C: AI Assistant

- `backend/services/aiService.js`
- `backend/services/preferenceExtractor.js`
- `backend/services/recommendationService.js`
- `backend/services/conversationService.js`
- `backend/services/supportKnowledgeService.js`
- `backend/services/kiosk`
- `frontend/components/assistant/AIAssistant.tsx`
- `frontend/components/kiosk`
- `frontend/data/supportKnowledge.ts`

### Phase D: Authentication Completion

- Existing customer auth components
- Customer controller/routes/model
- New password-reset model or fields only after the reset design is approved
- Email provider adapter and environment variables if email delivery is approved

### Phase E: Customer Page Polish

- Product detail component
- Shop catalog
- Support content
- Guide data/pages
- Cart and user-order pages

Routes should remain unchanged unless a verified blocker requires a route migration.

### Phase F: Documentation

- Root `README.md`
- `frontend/README.md`
- `docs/website-functions.md`
- Existing kiosk, voice, avatar, import, and payment documentation

## 3. Database Changes Needed

No database replacement is needed.

Immediate database work:

- Rotate the credential currently present in source control.
- Read the URI from `MONGODB_URI`.
- Back up the current MongoDB database before bulk enrichment.
- Add indexes only after measuring query patterns.
- Use idempotent Mongoose scripts for any document updates.

Potential small additions after approval:

- A unique sparse compound index on product `source` and `sourceProductId` for imported products.
- Optional normalized category/brand values if catalog filtering cannot be made reliable through mapping.
- Password reset token hash and expiry fields, or a small dedicated reset-token collection.
- Optional conversation persistence only if session continuity is required across server restarts.

Do not rename existing collections or required fields during the first repair phase.

## 4. SQL Schema Decision

Do not create a SQL schema.

The application already uses:

- MongoDB Atlas
- Mongoose schemas
- Existing product, customer, admin, cart, and order collections
- Live product data

Creating SQL tables would introduce a second persistence architecture and require rewriting working APIs. Any schema evolution should use backward-compatible Mongoose model changes and idempotent migration/enrichment scripts.

## 5. External Product Import Plan

The current backend already has the correct location for imports: `backend/scripts` and `backend/services/productImport`.

Recommended order:

1. Add a dry-run mode that reports inserts, updates, skips, and validation failures without writing.
2. Add local JSON and CSV import for complete new products, not only enrichment.
3. Keep JSON/CSV enrichment for existing products.
4. Keep Best Buy behind `BESTBUY_API_KEY` and official API terms.
5. Leave Amazon as a local dataset path until an official API client is implemented.
6. Normalize currency, category, brand, stock, image URLs, source IDs, and recommendation metadata in one service.
7. Upsert by source/source product ID and prevent duplicates.
8. Store import summaries and errors without exposing provider keys.

No scraping or anti-bot bypass should be added.

## 6. AI Assistant Improvement Without Breaking the API

Preserve:

- `POST /api/ai/recommend`
- Current structured response
- Gemini-first, OpenAI-fallback, local-parser fallback
- Existing product queries and scoring service
- Existing support and kiosk endpoints

Recommended improvements:

1. Introduce explicit provider selection using the already documented `AI_PROVIDER`.
2. Keep deterministic local ranking, but let the LLM turn verified recommendation facts into concise staff-style language.
3. Send only selected catalog facts to the LLM and prohibit invented specifications.
4. Improve comparison by accepting product IDs from the UI instead of relying only on model names in free text.
5. Store session context with TTL. Start with a bounded server cache; use MongoDB only if cross-instance persistence is required.
6. Add structured confidence and missing-data indicators.
7. Consolidate support FAQs so frontend and backend cannot drift.
8. Keep order tracking grounded in the real authenticated order API. Never generate an order status from the LLM.
9. Wire popup state to the existing VRM or explicitly document the portrait-only popup.
10. Remove the unused generic avatar only after confirming no consumer depends on it.

## 7. Sign Up and Forgot Password Plan

### Sign Up

Sign up already exists. Repair it rather than replacing it:

- Validate and normalize email.
- Validate password length.
- Stop logging passwords.
- Return a safe customer DTO without `password`.
- Decide whether registration should sign the user in automatically or continue redirecting to sign in.

### Sign In

- Return a consistent `{ user, token }` payload.
- Exclude password fields.
- Add centralized handling for token expiry.
- Consider httpOnly cookies in a separate approved security phase; this changes auth transport and should not be mixed into basic contract fixes.

### Forgot Password

The current page is informational only.

Minimum safe implementation after approval:

1. Request-reset endpoint accepts an email and always returns a neutral response.
2. Generate a cryptographically random token.
3. Store only a token hash and expiry.
4. Send a frontend reset link through an approved email provider.
5. Reset endpoint validates the token and updates the password through the Mongoose save hook.
6. Invalidate used/expired tokens.
7. Rate-limit reset requests.

Do not claim password reset works until email delivery and token validation are tested end to end.

## 8. Product Detail Improvement Based on Current Fields

The current page already supports:

- Product image
- Name
- Category
- Price
- Stock
- Description
- Quantity
- Add to cart
- Buy now
- Specifications when populated
- Related products
- AI context prompt

Safe next improvements:

- Show rating/review count only when present.
- Show brand, warranty, additional images, strengths, weaknesses, best-for, and review summary only when populated.
- Add robust image fallback.
- Avoid displaying empty recommendation sections.
- Use `images` as a gallery without removing the existing `image` fallback.
- Keep related products limited and improve matching through normalized category values.
- Ensure Buy Now waits for a successful cart mutation before navigation.

No new product table or route is required.

## 9. Support and Guides Using Existing Data

### Support

- Preserve `/support`.
- Move the shared FAQ source to a backend endpoint or generate both frontend and backend data from one canonical file.
- Keep search and topic filtering on the frontend.
- Connect order-specific answers to authenticated order APIs.
- Replace placeholder email/hotline details only when real contact data is provided.

### Guides

- Preserve `/guides` and `/guides/[slug]`.
- Keep the current TypeScript guide data initially.
- Improve related-product matching using normalized categories/tags.
- Add an admin/database guide model only if non-developers need content management.
- Do not create a guides collection solely for architectural symmetry.

## 10. Proposed Implementation Sequence

1. Security credential rotation and environment cleanup.
2. API response/request contract fixes.
3. Authentication data-exposure fixes.
4. Cart and order correctness fixes.
5. Tests for products, auth, cart, orders, and AI response shape.
6. Product import dry run and catalog enrichment.
7. AI comparison, explanation, and shared support knowledge.
8. Avatar state integration in the chosen assistant surface.
9. Forgot-password implementation.
10. Product/support/guides polish.
11. README and website function documentation.

## 11. Changes Requiring Confirmation

Approval is required before:

- Rotating/changing the production or shared MongoDB connection
- Running bulk enrichment or external import against the current database
- Adding or changing indexes
- Removing the duplicate customer model
- Changing JWT storage from local storage to cookies
- Adding password-reset persistence and an email provider
- Persisting AI conversations in MongoDB
- Removing the legacy generic avatar component
- Changing route structure
- Renaming fields or collections

## Recommended Approval Scope

The first implementation batch should be limited to:

- Move MongoDB configuration to `MONGODB_URI` after credential rotation
- Fix product search and pagination contracts
- Fix login response and password exposure
- Fix cart response handling and order creation response flow
- Add focused backend/frontend contract checks

This batch addresses correctness and security without changing the database schema, importing products, or replacing any current brand/avatar assets.
