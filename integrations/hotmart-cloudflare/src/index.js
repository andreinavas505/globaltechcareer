/**
 * Global Tech Career — Hotmart Webhook + GA4 Measurement Protocol
 * Routes: POST /api/hotmart/webhook, POST /api/checkout-click, GET /api/health
 */
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const PRODUCT_MAP = [
  { slug: "cloud-devops", terms: ["cloud", "devops"] },
  { slug: "cybersecurity-secops", terms: ["cybersecurity", "secops"] },
  { slug: "ai-mlops", terms: ["mlops", "artificial intelligence", "ai &"] },
  { slug: "data-engineering", terms: ["data engineering"] },
  { slug: "senior-backend", terms: ["senior backend", "backend engineering"] },
  { slug: "engineering-leadership", terms: ["engineering leadership"] },
  { slug: "sdet-test-automation", terms: ["sdet", "test automation"] },
  { slug: "platform-engineering", terms: ["platform engineering"] },
  { slug: "production-sre", terms: ["production sre", "site reliability"] }
];

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
function text(value, max = 255) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function money(obj) {
  const value = Number(obj?.value);
  const currency = text(obj?.currency_value, 3).toUpperCase();
  return Number.isFinite(value) && value >= 0 && /^[A-Z]{3}$/.test(currency)
    ? { value, currency } : null;
}
function identifyProduct(name) {
  const n = text(name, 300).toLowerCase();
  const found = PRODUCT_MAP.find(p => p.terms.some(term => n.includes(term)));
  return found?.slug || "unmapped";
}
async function sendGA4(env, clientId, eventName, params) {
  if (!clientId || !env.GA4_MEASUREMENT_ID || !env.GA4_API_SECRET) {
    return { sent: false, reason: "missing_client_or_ga4_config" };
  }
  const endpoint = new URL("https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", env.GA4_MEASUREMENT_ID);
  endpoint.searchParams.set("api_secret", env.GA4_API_SECRET);
  const payload = {
    client_id: clientId,
    events: [{ name: eventName, params: { engagement_time_msec: 1, ...params } }]
  };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return { sent: res.ok, status: res.status };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/health") {
      return response({ ok: true, service: "gtc-hotmart-webhook", version: "1.0.0" });
    }
    if (request.method === "POST" && url.pathname === "/api/checkout-click") {
      return saveCheckoutClick(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/hotmart/webhook") {
      return handleHotmartWebhook(request, env);
    }
    return response({ error: "Not found" }, 404);
  }
};

async function saveCheckoutClick(request, env) {
    let body;
    try { body = await request.json(); } catch { return response({ error: "Invalid JSON" }, 400); }
    const clickId = text(body.click_id, 80);
    const product = text(body.product, 80);
    const clientId = text(body.client_id, 80);
    if (!/^[a-zA-Z0-9_-]{12,80}$/.test(clickId) || !/^[a-z0-9-]{2,80}$/.test(product)) {
      return response({ error: "Invalid click_id or product" }, 400);
    }
    await env.DB.prepare(`
      INSERT INTO checkout_clicks
      (sck, product_slug, client_id, utm_source, utm_medium, utm_campaign, utm_content, landing_page, referrer, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(sck) DO UPDATE SET
        client_id = excluded.client_id,
        product_slug = excluded.product_slug
    `).bind(
      clickId, product, clientId || null,
      text(body.utm_source, 120), text(body.utm_medium, 120),
      text(body.utm_campaign, 120), text(body.utm_content, 120),
      text(body.landing_page, 500), text(body.referrer, 500),
      new Date().toISOString()
    ).run();
    return response({ ok: true });
  },

async function handleHotmartWebhook(request, env) {
    const token = request.headers.get("X-HOTMART-HOTTOK") || "";
    if (!env.HOTMART_HOTTOK || !constantTimeEqual(token, env.HOTMART_HOTTOK)) {
      return response({ error: "Unauthorized" }, 401);
    }
    let payload;
    try { payload = await request.json(); } catch { return response({ error: "Invalid JSON" }, 400); }

    const eventId = text(payload.id, 150);
    const eventName = text(payload.event, 80).toUpperCase();
    const data = payload.data || {};
    const product = data.product || {};
    const purchase = data.purchase || {};
    const transaction = text(purchase.transaction, 150);
    if (!eventId || !eventName) return response({ error: "Missing event id or event name" }, 422);

    const supported = ["PURCHASE_APPROVED", "PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_PROTEST"];
    if (!supported.includes(eventName)) return response({ ok: true, ignored: eventName });

    if (!transaction) return response({ error: "Missing purchase.transaction" }, 422);
    if (eventName === "PURCHASE_APPROVED" && !(money(purchase.full_price) || money(purchase.price) || money(purchase.original_offer_price))) {
      return response({ error: "Purchase amount or currency missing" }, 422);
    }
    const inserted = await env.DB.prepare(
      "INSERT OR IGNORE INTO webhook_events (event_id, event_name, received_at) VALUES (?, ?, ?)"
    ).bind(eventId, eventName, new Date().toISOString()).run();
    if (!inserted.meta?.changes) return response({ ok: true, duplicate: true });

    const productName = text(product.name, 300) || "Hotmart product";
    const clickId = text(purchase.origin?.sck, 80);
    const click = clickId
      ? await env.DB.prepare("SELECT * FROM checkout_clicks WHERE sck = ?").bind(clickId).first()
      : null;
    const productSlug = click?.product_slug || identifyProduct(productName);
    const amount = money(purchase.full_price) || money(purchase.price) || money(purchase.original_offer_price);
    const now = new Date().toISOString();

    if (eventName === "PURCHASE_APPROVED") {
      const result = await env.DB.prepare(`
        INSERT OR IGNORE INTO sales
        (transaction_id, product_id, product_name, product_slug, status, value, currency, country,
         sck, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'APPROVED', ?, ?, ?, ?, ?, ?)
      `).bind(
        transaction, String(product.id || ""), productName, productSlug,
        amount.value, amount.currency, text(purchase.checkout_country?.iso, 2),
        clickId || null, now, now
      ).run();

      if (!result.meta?.changes) return response({ ok: true, duplicate_transaction: true });
      const ga = await sendGA4(env, click?.client_id, "purchase", {
        transaction_id: transaction,
        currency: amount.currency,
        value: amount.value,
        items: [{
          item_id: String(product.id || productSlug),
          item_name: productName,
          item_category: productSlug,
          price: amount.value,
          quantity: 1
        }],
        campaign_source: click?.utm_source || "hotmart",
        campaign_medium: click?.utm_medium || "checkout",
        campaign_name: click?.utm_campaign || "hotmart_purchase",
        campaign_content: click?.utm_content || productSlug
      });
      await env.DB.prepare("UPDATE sales SET ga4_purchase_status = ?, updated_at = ? WHERE transaction_id = ?")
        .bind(ga.sent ? "sent" : ga.reason || "failed", now, transaction).run();
      return response({ ok: true, sale_recorded: true, ga4: ga });
    }

    const status = eventName === "PURCHASE_REFUNDED" ? "REFUNDED" : "CHARGEBACK";
    const update = await env.DB.prepare(`
      UPDATE sales SET status = ?, updated_at = ?
      WHERE transaction_id = ? AND status = 'APPROVED'
    `).bind(status, now, transaction).run();
    if (!update.meta?.changes) {
      await env.DB.prepare(`
        INSERT OR IGNORE INTO sales
        (transaction_id, product_id, product_name, product_slug, status, value, currency, sck, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        transaction, String(product.id || ""), productName, productSlug, status,
        amount?.value ?? null, amount?.currency ?? null, clickId || null, now, now
      ).run();
      return response({ ok: true, sale_status: status, ga4: "no_prior_approved_sale" });
    }
    const sale = await env.DB.prepare("SELECT * FROM sales WHERE transaction_id = ?").bind(transaction).first();
    const ga = status === "REFUNDED"
      ? await sendGA4(env, click?.client_id, "refund", {
          transaction_id: transaction,
          currency: sale?.currency || amount?.currency || "USD",
          value: sale?.value ?? amount?.value ?? 0
        })
      : { sent: false, reason: "chargeback_recorded_without_ga4_event" };
    await env.DB.prepare("UPDATE sales SET ga4_refund_status = ?, updated_at = ? WHERE transaction_id = ?")
      .bind(ga.sent ? "sent" : ga.reason || "failed", now, transaction).run();
    return response({ ok: true, sale_status: status, ga4: ga });
}
