# 4Kay Store Project Audit

Audit date: June 12, 2026

This report describes the repository as it currently exists. It does not propose a replacement database or assume fields that are not present in the code.

## Current Tech Stack

### Frontend

- Next.js 14.2 with the App Router
- React 18.3
- TypeScript
- TanStack React Query for server data fetching on interactive pages
- Axios for HTTP requests
- Zustand with local-storage persistence for cart state
- Next Auth is installed, but the customer/admin authentication flow does not use it

### Backend

- Node.js
- Express 4
- CommonJS modules
- JSON Web Tokens for customer and admin authentication
- bcryptjs for password hashing

### Database and Query Method

- MongoDB
- Mongoose ODM
- There is no SQL database, Prisma schema, Sequelize, TypeORM, or raw SQL layer
- Mongoose models currently cover products, customers, admins, carts, and orders

The live local backend was reachable during this audit and reported 77 products.

### Styling and UI

- Tailwind CSS 3
- CSS variables and global styles in `frontend/app/globals.css`
- Local reusable UI components under `frontend/components/ui`
- Radix UI, Headless UI, Material UI icons, and Lucide icons are also installed
- The current customer storefront uses a warm cream/orange 4Kay visual system

### 3D and Voice

- Three.js
- React Three Fiber
- React Three Drei
- `@pixiv/three-vrm` and `@pixiv/three-vrm-animation`
- Browser Speech Recognition for voice input
- Browser Speech Synthesis, with optional Kokoro and Piper provider adapters for kiosk speech

### AI Assistant Integration

- Frontend calls the Express backend through Axios
- Main endpoint: `POST /api/ai/recommend`
- Kiosk endpoint: `POST /api/ai/kiosk`
- Gemini is the first configured LLM parser
- OpenAI Chat Completions is a fallback parser
- Local rule-based parsing and ranking continue to work when no LLM key is available
- The LLM currently extracts shopping intent and preferences; final product ranking and response construction are local application logic

### Current API Structure

The Express server mounts:

- `/api/customers`
- `/api/admins`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/orderProcessing`
- `/api/ai`
- `/api/payments`

## Current Folder Structure

### Repository Roots

- `frontend`: Next.js storefront and admin frontend
- `backend`: Express API, Mongoose models, services, and scripts
- `docs`: project-specific setup and feature notes
- `.env.example`: combined environment variable reference

### Product and Storefront Files

- `frontend/app/(routes)/page.tsx`: storefront home route
- `frontend/components/home/StorefrontHome.tsx`: home experience and embedded VRM scene
- `frontend/app/(routes)/shop/page.tsx`: all-products page
- `frontend/app/(routes)/shop/[category]/page.tsx`: category product page
- `frontend/components/storefront/ShopCatalog.tsx`: client-side search, filtering, sorting, and pagination
- `frontend/app/(routes)/categories/page.tsx`: category landing page
- `frontend/app/(routes)/product/[productId]/page.tsx`: product detail route
- `frontend/app/(routes)/product/[productId]/_components/product-item.tsx`: product detail implementation
- `frontend/components/storefront/ProductCard.tsx`: shared customer product card
- `frontend/app/(admin)/admin/products`: admin product list, create, and edit pages

### Authentication Files

- `frontend/app/(auth)/customer-sign-in/page.tsx`
- `frontend/app/(auth)/customer-sign-up/page.tsx`
- `frontend/app/(auth)/forgot-password/page.tsx`
- `frontend/app/(auth)/components/customer-sign-in.tsx`
- `frontend/app/(auth)/components/customer-sign-up.tsx`
- `frontend/app/(auth)/components/forgot-password.tsx`
- `frontend/app/utils/authContext.tsx`
- `backend/routes/customerRoutes.js`
- `backend/controllers/customerController.js`
- `backend/middleware/authMiddleware.js`

Admin authentication has separate routes, controllers, models, and frontend pages.

### Cart and Order Files

- `frontend/hooks/use-cart.tsx`
- `frontend/app/(routes)/cart`
- `frontend/app/(routes)/user-orders`
- `backend/models/cartModel.js`
- `backend/controllers/cartController.js`
- `backend/routes/cartRoutes.js`
- `backend/models/orderModel.js`
- `backend/controllers/orderController.js`
- `backend/routes/orderRoutes.js`

### Support and Guide Files

- `frontend/app/(routes)/support/page.tsx`
- `frontend/components/storefront/SupportContent.tsx`
- `frontend/data/supportKnowledge.ts`
- `frontend/app/(routes)/guides/page.tsx`
- `frontend/app/(routes)/guides/[slug]/page.tsx`
- `frontend/data/guidesData.ts`
- `backend/services/supportKnowledgeService.js`

### AI and Avatar Files

- `frontend/components/assistant/AIAssistant.tsx`
- `frontend/components/assistant/Avatar3D.tsx`
- `frontend/components/kiosk`
- `frontend/hooks/useVrmAvatar.ts`
- `frontend/hooks/useVrmExpressions.ts`
- `frontend/hooks/useVrmGestures.ts`
- `frontend/hooks/useVrmLipSync.ts`
- `frontend/hooks/useAssistantTts.ts`
- `frontend/hooks/useSpeechRecognition.ts`
- `backend/routes/aiRoutes.js`
- `backend/controllers/aiController.js`
- `backend/services/aiService.js`
- `backend/services/recommendationService.js`
- `backend/services/preferenceExtractor.js`
- `backend/services/conversationService.js`
- `backend/services/kiosk`

### Database and Import Files

- `backend/db.js`: MongoDB connection
- `backend/models`: Mongoose schemas
- `backend/scripts/enrichProducts.js`: JSON/CSV enrichment for existing products
- `backend/scripts/importBestBuyProducts.js`: Best Buy API importer
- `backend/scripts/importAmazonProducts.js`: Amazon dataset/import entry point
- `backend/services/productImport`: provider adapters and normalization
- `backend/scripts/sample-product-enrichment.json`: enrichment example

## Current Product Data Model

The actual Mongoose product model is `backend/models/productModel.js`.

Required core fields:

- `_id`: MongoDB ObjectId, generated by MongoDB
- `name`: string, required
- `description`: string, required
- `price`: number, required
- `stock`: number, required
- `category`: string, required

Optional or defaulted commerce fields:

- `currency`: string, default `VND`
- `originalPrice`: number or null
- `originalCurrency`: string
- `image`: string
- `images`: string array
- `brand`: string
- `shortDescription`: string
- `longDescription`: string
- `availability`: string
- `warranty`: string
- `releaseYear`: number or null

Recommendation fields already present:

- `specs`: flexible embedded object, with known keys for CPU, GPU, RAM, storage, screen size, battery, camera, weight, and operating system
- `useCases`: string array
- `strengths`: string array
- `weaknesses`: string array
- `bestFor`: string array
- `notBestFor`: string array
- `reviewSummary`: string
- `tags`: string array
- `rating`: number from 0 to 5 or null
- `reviewCount`: non-negative number

Import provenance fields:

- `source`: string, default `local`
- `sourceProductId`: string
- `sourceUrl`: string

Mongoose also adds `createdAt`, `updatedAt`, and `__v`.

The live product samples inspected during this audit contain the core fields and Mongoose defaults. Their richer recommendation arrays and text fields are mostly empty, so model support exists but the current catalog still needs enrichment.

The frontend `Product` type includes the core and recommendation fields, but omits several backend fields such as brand, currency, additional images, source metadata, warranty, and release year.

## Current Database Situation

- The project uses MongoDB Atlas through Mongoose.
- The connection is created in `backend/db.js`.
- The MongoDB URI is currently hard-coded in source code rather than read from `MONGODB_URI`.
- No SQL files, SQL migrations, or relational schema were found.
- No Mongoose migration framework is present.
- Collections are inferred from the Mongoose models.
- Product data is not hard-coded in the storefront. Customer pages load products from `/api/products`.
- Local JSON is used only as an optional enrichment/import source, not as the primary storefront database.

Existing Mongoose models:

- Product
- Customer
- Admin
- Cart with embedded cart items
- Order with embedded order items

There are two near-identical customer model files:

- `models/customerModel.js`
- `models/Customer.js`

The active controllers and middleware import `customerModel.js`.

## Current Product Flow

1. Next.js pages call `publicApi` from `frontend/lib/apiCalls.ts`.
2. Axios requests the Express `/api/products` endpoints.
3. The product controller queries MongoDB through the Mongoose `Product` model.
4. The home, shop, categories, guides, and product detail pages render live database products.
5. The shop page retrieves all products and performs text filtering, category filtering, brand inference, price filtering, sorting, and eight-item pagination in the browser.
6. The product detail page retrieves the selected product and then loads products from the same category for related recommendations.
7. Admin create/edit pages call protected product endpoints.

The admin forms currently expose only the original core fields. They do not provide controls for most recommendation or import fields already supported by the model.

## Current Cart Flow

1. Authentication state is stored in browser `localStorage` under `user`.
2. Zustand persists a second client-side cart snapshot under `cart-storage`.
3. Cart mutations call protected Express endpoints with a bearer token.
4. The backend stores one MongoDB cart per customer.
5. Product price is read from the database when adding or updating quantity.
6. Checkout creates an order from the server cart and then removes the cart.
7. The user-orders page loads protected order history from MongoDB.

The server is the authoritative cart data source during mutations, but the frontend also persists cart data locally. There is no explicit cart fetch/synchronization on login or app startup.

## Current Authentication Flow

### Implemented

- Customer sign up page and `POST /api/customers/register`
- Customer sign in page and `POST /api/customers/login`
- Admin sign in and registration flows
- bcrypt password hashing
- JWT creation with a three-hour expiry
- Bearer-token middleware for protected customer/admin endpoints
- Customer account menu with My Orders and Sign out

Customer fields currently used:

- `name`
- `email`
- `password`
- optional `phone`
- optional `address`

### Incomplete or Inconsistent

- Forgot-password has a frontend information page only; there is no reset token, email, or backend reset endpoint.
- The customer login backend returns a token but not a `user` object, while the frontend expects both.
- The register endpoint returns the saved Mongoose customer document, which includes the password hash unless response serialization is changed.
- Public customer lookup/list endpoints can return customer documents without removing passwords.
- JWTs are persisted in local storage rather than an httpOnly cookie.
- The duplicate customer model file should be removed only after verifying that no external code imports it.
- Next Auth is installed but unused.

## Current AI Assistant Flow

### Storefront Assistant

1. `AIAssistant.tsx` sends the message, conversation ID, optional user ID, pathname, and page context to `POST /api/ai/recommend`.
2. `aiController.js` stores the latest messages and accumulated preferences in an in-memory `Map`.
3. `aiService.js` first checks local support-answer keywords.
4. It performs local intent/preference extraction.
5. If `GEMINI_API_KEY` is configured, Gemini `gemini-flash-latest` is asked to return structured JSON preferences.
6. If Gemini is unavailable or fails, OpenAI is attempted when `OPENAI_API_KEY` exists.
7. If neither provider is available, local extraction remains active.
8. `recommendationService.js` queries actual MongoDB products, scores them, and builds reasons, trade-offs, best-for text, and alternatives.
9. The backend returns structured JSON and the popup renders product actions.

This is a real API-backed assistant, not a mock response component. However, the LLM is currently used for preference extraction rather than generating the final sales explanation.

Required or supported backend environment variables:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `JWT_SECRET`
- intended but currently unused by `db.js`: `MONGODB_URI`

Frontend API configuration:

- `NEXT_PUBLIC_API_URL`

Voice and kiosk configuration also supports:

- `NEXT_PUBLIC_SPEECH_LANG`
- `NEXT_PUBLIC_TTS_PROVIDER`
- Kokoro/Piper URL and voice variables
- `NEXT_PUBLIC_DEBUG_AVATAR_CONTROLS`

`AI_PROVIDER` appears in `.env.example` but is not read by the current AI service.

### Conversation Limits

- Conversation state is process memory only.
- It is lost whenever the backend restarts.
- There is no TTL, persistence, per-user ownership validation, or multi-instance coordination.
- Only the latest 12 messages are retained.

### Avatar Situation

The current floating assistant popup does not use the generic robot. It uses:

- `/images/ai-assistant-portrait.png` for the popup portrait
- `/models/avatar/avatar.vrm` for the live React Three Fiber VRM scenes

`components/assistant/Avatar3D.tsx` still contains an older generic Three.js placeholder robot, but no current import of that component was found. It is dead/legacy code unless another untracked consumer exists.

The real VRM is rendered on the home page and shared assistant visuals through `KioskScene`. The popup itself uses a static portrait, so its internal `idle/listening/thinking/talking` state does not currently animate the VRM inside the popup.

## Current UI Pages

Customer-facing routes currently present:

- `/`: storefront home
- `/shop`: all products
- `/shop/[category]`: category products
- `/categories`: category landing page
- `/product/[productId]`: product detail
- `/cart`: authenticated cart
- `/user-orders`: order history
- `/guides`: guide listing
- `/guides/[slug]`: guide detail
- `/support`: support topics and FAQs
- `/customer-sign-in`
- `/customer-sign-up`
- `/forgot-password`

Admin routes currently present:

- Admin sign in/sign up
- Dashboard
- Products list/create/edit
- Orders
- Customers
- Admin users

Incomplete customer UI behavior:

- Forgot password is informational only.
- Newsletter subscription is visual only.
- Support email and hotline use placeholder contact details.
- The support FAQ and guide content are local TypeScript data, not database-managed.
- The full kiosk assistant component exists, but the storefront currently embeds only its scene while the floating popup uses the separate recommend endpoint.

## Current Assets

Existing brand and avatar assets that should be preserved:

- `frontend/public/logo.jpeg`: current 4Kay logo
- `frontend/public/images/ai-assistant-portrait.png`: assistant portrait
- `frontend/public/models/avatar/avatar.vrm`: real VRM/VRoid assistant model
- `frontend/public/default-avatar.png`: older/default avatar image
- `frontend/public/banner.png`: existing banner asset

The current `Logo` component correctly reuses `/logo.jpeg`.

> Historical audit note: this document records issues found during the original
> review. Several items below have since been fixed. Verify current source code
> before treating an item as unresolved.

## Problems Found

### Security and Data Exposure

1. Resolved in source: `backend/db.js` now requires `MONGODB_URI`. The previously exposed MongoDB credential must still be rotated before publishing.
2. Customer registration logs the complete request body, including the plaintext password.
3. Customer registration returns the saved customer document, which can expose the password hash.
4. Public customer detail/list endpoints do not exclude password fields and are not protected.
5. JWTs are stored in local storage, increasing the impact of any cross-site scripting issue.
6. Payment creation and payment status routes are not protected in `paymentRoutes.js`.

### API Contract Defects

1. `GET /api/products/findByName` is declared after `GET /api/products/:id`, so `findByName` can be captured as a product ID.
2. The frontend sends `keyword` in the query string, but `findProducts` reads `req.body.keywords` on a GET request.
3. The frontend reads `res.data.total`, while the product API returns `totalProducts`.
4. Category requests omit `page` and `limit`, while the controller parses them without defaults.
5. Customer login returns only a token, but the frontend constructs the user from `res.data.user`.
6. Protected cart update/remove wrappers return `res.data.cart`, while the backend returns top-level `items` and `totalPrice`.
7. Order creation calls the cart controller as an HTTP response handler and then attempts to send a second order response. This can cause “headers already sent” behavior.
8. Product create/update controllers expose only a subset of model fields, and update operations can write `undefined` over fields not included by the admin form.

### Data and Model Consistency

1. Two customer model files define the same Mongoose model.
2. Frontend and backend product types are not fully aligned.
3. Most live products have empty recommendation metadata, limiting ranking quality.
4. Category and brand matching rely heavily on English keywords and product-name inference, while current database categories include Vietnamese values.
5. Support knowledge exists separately in frontend and backend files and can drift.
6. Guides and FAQs are static frontend data despite the model/import plan mentioning database-managed content.

### AI and Avatar

1. `AI_PROVIDER` is documented but unused.
2. The chosen LLM only extracts preferences; final language remains template-based.
3. Conversation storage is volatile process memory.
4. Product comparison parses names by splitting free text and may fail on natural phrasing.
5. Support matching is simple substring matching.
6. The popup uses the real portrait but does not render the stateful VRM.
7. The unused generic `Avatar3D.tsx` can confuse future maintainers.
8. The existing kiosk documentation still says the avatar is a placeholder, but the live code now loads a real VRM.

### Documentation and Maintenance

1. The root README contains only the project title.
2. The frontend README is still the default Create Next App text.
3. The backend has no real automated test suite.
4. Several source files contain mojibake/encoding artifacts in Vietnamese text.
5. Environment documentation does not match the active `db.js` implementation.
6. The repository currently has many uncommitted changes, so cleanup should preserve user work and be split into deliberate commits.

## Safe Next Steps

Recommended sequence:

1. Rotate the previously exposed MongoDB credential and verify the replacement `MONGODB_URI`.
2. Repair API contracts for login, product search, category pagination, cart mutations, and order creation before adding new features.
3. Remove password data from all responses and protect customer/payment endpoints according to ownership and role.
4. Create shared runtime validation or explicit DTO mappers so frontend types match backend responses.
5. Enrich existing MongoDB products through the existing JSON/CSV script before changing the schema.
6. Improve AI behavior on top of `/api/ai/recommend`; preserve Gemini/OpenAI/local fallbacks and the current product service.
7. Consolidate support knowledge into one backend/API source or a shared generated artifact.
8. Connect the floating assistant to the existing VRM state system, or clearly retain the portrait as the lightweight popup representation.
9. Implement password reset only after choosing a token/email delivery design.
10. Replace the placeholder READMEs with verified setup and architecture documentation after the approved fixes are complete.

No SQL schema should be created for the current project. The existing database is MongoDB and already has active collections and data.
