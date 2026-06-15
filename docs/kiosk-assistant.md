# 3D Kiosk Assistant

The kiosk assistant is the main AI shopping surface for the storefront. It keeps the existing eCommerce system intact and adds a new kiosk endpoint:

```http
POST /api/ai/kiosk
```

Request:

```json
{
  "message": "I need a laptop under 20 million VND for programming and light gaming",
  "conversationId": "optional",
  "userId": "optional",
  "selectedProductIds": [],
  "context": {}
}
```

The backend flow is modular:

- `aiIntentService`: detects greeting, recommendation, comparison, checkout, payment, and refinement intents.
- `preferenceExtractionService`: extracts category, budget, use cases, brands, important factors, and specs.
- `productRankingService`: ranks real database products with score details.
- `comparisonService`: builds comparison panels.
- `staffResponseService`: turns recommendation data into concise store-staff style language.
- `kioskStateService`: maps backend state to `idle`, `greeting`, `listening`, `thinking`, `talking`, `presenting`, `comparing`, `checkout`, or `error`.

Frontend components live in `frontend/components/kiosk`.

The current 3D model is a Three.js placeholder kiosk. Replace the grouped geometry in `KioskAvatar.tsx` with a GLB/GLTF model later, keeping the state animation hooks.

Test prompts:

```text
I need a laptop under 20 million VND for programming and light gaming.
I'm a student and I carry my laptop every day.
Recommend me a phone with good camera and battery.
Compare these two laptops.
Why is this one better?
Show me a cheaper option.
Add the first one to my cart.
I want to pay now.
Can I pay by QR?
```
