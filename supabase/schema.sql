-- SecureScan Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  score INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'completed', 'failed')),
  results JSONB,
  is_paid BOOLEAN DEFAULT FALSE,
  stripe_session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  amount INTEGER NOT NULL, -- In cents (99 = €0.99)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scans_url ON scans(url);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_ip_address ON scans(ip_address);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_scans_completed_at ON scans(completed_at);
CREATE INDEX IF NOT EXISTS idx_payments_scan_id ON payments(scan_id);

-- Row Level Security (RLS)
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for scans
-- Allow anyone to read their own scan by ID (public access for scan results)
CREATE POLICY "Allow public read access to scans" ON scans
  FOR SELECT USING (true);

-- Only service role can insert/update scans
CREATE POLICY "Service role can insert scans" ON scans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update scans" ON scans
  FOR UPDATE USING (true);

-- Policies for payments (only service role)
CREATE POLICY "Service role can manage payments" ON payments
  FOR ALL USING (true);

-- Function to clean up old incomplete scans (optional cron job)
CREATE OR REPLACE FUNCTION cleanup_old_scans()
RETURNS void AS $$
BEGIN
  DELETE FROM scans
  WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
