CREATE TABLE IF NOT EXISTS clearance_requests (
  id uuid PRIMARY KEY,
  session_hash text NOT NULL,
  ip_hash text NOT NULL,
  state text NOT NULL,
  amount_tinybars numeric(30,0) NOT NULL,
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS clearance_requests_created_idx ON clearance_requests(created_at);
CREATE INDEX IF NOT EXISTS clearance_requests_ip_idx ON clearance_requests(ip_hash, created_at);
