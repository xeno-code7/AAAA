import { createClient } from '@supabase/supabase-js'

// Ambil dari environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nlspaernjscgaggjzujy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sc3BhZXJuanNjZ2FnZ2p6dWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MTQxMTEsImV4cCI6MjA3OTM5MDExMX0.jSmGgpAiWIUs2voqBWePS58WD7akCwXMVdg-2y6j7us'

// Validasi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Storage bucket name
export const STORAGE_BUCKET = 'bookletku'

// Default store ID
export const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001'

export default supabase
/*
========================================
CARA SETUP SUPABASE:
========================================

1. Buka https://supabase.com dan login/register
2. Klik "New Project"
3. Isi nama project, password database, dan pilih region
4. Tunggu project selesai dibuat

5. Buka SQL Editor dan jalankan query berikut:

----------------------------------------
-- Create stores table
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'My Store',
  whatsapp_number VARCHAR(20) DEFAULT '628123456789',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  category VARCHAR(50) DEFAULT 'food',
  photo TEXT,
  views INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default store
INSERT INTO stores (id, name, whatsapp_number) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Warung Makan Barokah', '628123456789');

-- Create indexes for better performance
CREATE INDEX idx_menu_items_store_id ON menu_items(store_id);
CREATE INDEX idx_menu_items_sort_order ON menu_items(sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for demo - adjust for production)
CREATE POLICY "Allow all for stores" ON stores FOR ALL USING (true);
CREATE POLICY "Allow all for menu_items" ON menu_items FOR ALL USING (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
----------------------------------------

6. Buka Project Settings > API
7. Copy "Project URL" dan "anon public" key
8. Buat file .env di root project:

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

*/