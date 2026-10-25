-- =============================================================================
-- SUPABASE TABLE SCHEMA FOR DASHBOARD LINKS
-- =============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor (or New Query)

-- 1. Create table
CREATE TABLE IF NOT EXISTS dashboard_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE dashboard_links ENABLE ROW LEVEL SECURITY;

-- 3. Create access policy for anonymous read / write (using public anon key)
DROP POLICY IF EXISTS "Public full access" ON dashboard_links;
CREATE POLICY "Public full access" 
  ON dashboard_links 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 4. Seed with initial links (optional, if table is empty)
INSERT INTO dashboard_links (title, url, category) VALUES
  ('INTERNSHIP DETAILS', 'https://docs.google.com/spreadsheets/d/1HaWsE2UKkIJm_iEH40RqI4dn9N3laZ2G2Hi5s_crgG0/edit?usp=drive_link', 'Internship'),
  ('CODING PROGRESS', 'https://drive.google.com/drive/folders/1LP3H60HqTGiF5s3YaXwcrnO9sAg1A7x6?usp=drive_link', 'Coding'),
  ('NPTEL', 'https://drive.google.com/drive/folders/1h1QcjQcIabOl6-iWaXV4HQBtrKJiff16?usp=drive_link', 'Academics'),
  ('NPTEL FINAL COURSES', 'https://docs.google.com/spreadsheets/d/1R0xV1jgsjjX9aEPGdFMOtCNKx9PaaXLSVQkuuEN_zsA/edit?usp=drive_link', 'Academics'),
  ('VVITU', 'https://drive.google.com/drive/folders/1txSN7Jgya_lVMusTO68Sjtbl9YR9tVG4?usp=drive_link', 'University'),
  ('COLLEGE DATA', 'https://vvitguntur-my.sharepoint.com/:f:/g/personal/23bq1a0539_vvit_net/IgCxCS4AoIA_ToaGmNzCeMP1AX7YjKtcyUrt1W43hbUpohs?e=0aZzRW', 'College');
