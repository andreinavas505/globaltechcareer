CREATE TABLE IF NOT EXISTS checkout_clicks (
  sck TEXT PRIMARY KEY,
  product_slug TEXT NOT NULL,
  client_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  landing_page TEXT,
  referrer TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_checkout_clicks_created_at ON checkout_clicks(created_at);

CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  received_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at);

CREATE TABLE IF NOT EXISTS sales (
  transaction_id TEXT PRIMARY KEY,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  status TEXT NOT NULL,
  value REAL,
  currency TEXT,
  country TEXT,
  sck TEXT,
  ga4_purchase_status TEXT,
  ga4_refund_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_product_slug ON sales(product_slug);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
