# Product Import

The project supports three import/enrichment paths:

1. Existing product enrichment from JSON/CSV.
2. Best Buy Products API import.
3. Amazon official API placeholder or local Amazon dataset import.

## Enrich Existing Products

Match by `_id`, `id`, `productId`, or exact `name`.

```powershell
cd backend
npm run enrich:products -- scripts\sample-product-enrichment.json
```

Supported enrichment fields include:

- `specs`
- `useCases`
- `strengths`
- `weaknesses`
- `bestFor`
- `notBestFor`
- `reviewSummary`
- `tags`
- `rating`
- `reviewCount`

## Best Buy

Recommended external data source.

Environment:

```env
BESTBUY_API_KEY=
BESTBUY_IMPORT_KEYWORDS=laptop,gaming laptop,phone,tablet,headphones,monitor
USD_TO_VND=25000
```

Run:

```powershell
cd backend
npm run import:bestbuy
```

Or pass keywords:

```powershell
npm run import:bestbuy -- laptop,phone,monitor
```

The importer upserts by `source = bestbuy` and `sourceProductId = sku`.

## Amazon

Do not scrape Amazon pages directly.

Use official Amazon API credentials when available, or import a local school-demo dataset.

Environment:

```env
AMAZON_API_TYPE=creators
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=
AMAZON_MARKETPLACE=US
```

Local dataset:

```powershell
cd backend
npm run import:amazon -- data\amazon-products.json
```

The current Amazon provider intentionally prints a clear message if official credentials are missing.
