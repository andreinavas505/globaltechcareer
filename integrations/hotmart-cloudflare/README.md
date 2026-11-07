# Global Tech Career — Hotmart → Cloudflare D1 → GA4

This Worker receives Hotmart Webhook v2 events, stores minimal sales records in D1, deduplicates webhook deliveries and sends confirmed purchase/refund events to GA4 Measurement Protocol.

## Routes

- `GET /api/health` — health check.
- `POST /api/checkout-click` — stores a checkout click and its GA client ID, keyed by Hotmart `sck`.
- `POST /api/hotmart/webhook` — receives Hotmart Webhook v2.

## Data flow

1. The website creates a unique `sck` value on a Hotmart checkout click.
2. It stores the value, GA4 client ID (when analytics consent is granted), product and UTM data in D1.
3. The same `sck` is appended to the Hotmart checkout URL.
4. Hotmart sends `purchase.origin.sck` in the v2 purchase webhook.
5. The Worker validates `X-HOTMART-HOTTOK`, deduplicates the event and transaction, stores the sale, and sends GA4 `purchase` / `refund` events when a matching consented GA client ID exists.

If no GA client ID is available (for example, the visitor rejected analytics cookies), the sale is still recorded in D1 but is not sent to GA4. This avoids fabricating a GA user/session identity. The D1 sales table remains the operational sales record.

## Create and configure

Prerequisites: Node.js 20+ and a Cloudflare account with Workers, D1, and the `globaltechcareer.com` zone.

From this folder:

```bash
npm install
npx wrangler login
npx wrangler d1 create gtc-sales
```

Copy the returned database UUID into `wrangler.jsonc`, replacing `REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID`.

Apply the schema:

```bash
npx wrangler d1 migrations apply gtc-sales --remote
```

Add secrets (the values are entered locally in your terminal; never commit them or paste them into chat):

```bash
npx wrangler secret put HOTMART_HOTTOK
npx wrangler secret put GA4_API_SECRET
```

Deploy:

```bash
npx wrangler deploy
```

Verify:

```bash
curl https://globaltechcareer.com/api/health
```

Expected: `{"ok":true,"service":"gtc-hotmart-webhook","version":"1.0.0"}`

## Hotmart setup

In Hotmart > Tools > Webhook (API and notifications):

- Create a Webhook configuration using version **2.0.0**.
- Select the Global Tech Career products (or all relevant products).
- Destination URL: `https://globaltechcareer.com/api/hotmart/webhook`.
- Enable **Purchase approved**, **Purchase refunded**, and **Chargeback**.
- Save and run Hotmart's test delivery. Confirm a successful response in Hotmart's delivery history.

Hotmart sends the authentication token in the `X-HOTMART-HOTTOK` header. Configure the same Hottok as the Worker secret `HOTMART_HOTTOK`.

## GA4 setup

In GA4 Admin > Data streams > Web > Measurement Protocol API secrets, create an API secret and store it as Worker secret `GA4_API_SECRET`. The Measurement ID is already configured as `G-96MRR9EKX4`.

The API secret must remain server-side. Do not add it to the website JavaScript or GitHub.

## Verification and limitations

- A real approved purchase is required to verify end-to-end revenue reporting.
- GA4 purchase/refund events are only sent when a consented website click was matched to the webhook by `purchase.origin.sck`.
- Sales without a matching click/client ID are still recorded in D1 and marked as not sent to GA4.
- Hotmart test webhooks may not represent a real purchase and may not match an existing click.
- This Worker stores no buyer email, name, phone, or full raw webhook payload.
- This integration does not change Hotmart access delivery or membership permissions.

## Tables

- `checkout_clicks`: click-to-checkout attribution keys and consented GA client IDs.
- `webhook_events`: webhook event IDs for delivery deduplication.
- `sales`: transaction-level sale/refund/chargeback ledger and GA4 delivery status.

## Useful SQL

```sql
SELECT status, currency, COUNT(*) AS transactions, SUM(value) AS gross_value
FROM sales
GROUP BY status, currency
ORDER BY status, currency;

SELECT product_slug, status, COUNT(*) AS transactions, SUM(value) AS gross_value
FROM sales
GROUP BY product_slug, status
ORDER BY product_slug, status;
```
