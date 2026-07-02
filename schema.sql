-- Database Schema for Top Muscle Nutrition
-- Run this script in the Supabase SQL Editor to set up your tables, security, and policies.

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT
);


-- 2. Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  short_description TEXT,
  long_description TEXT,
  benefits TEXT,
  ingredients TEXT,
  nutrition TEXT,
  usage TEXT,
  warnings TEXT,
  featured BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT true,
  weight TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create product_images table (max 10 images per product managed by application logic)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 4. Create authentication_codes table for product verification
CREATE TABLE IF NOT EXISTS authentication_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  unique_code TEXT NOT NULL UNIQUE,
  manufacturing_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active'
);

-- 5. Create settings table (Single-row configuration)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'Top Muscle Nutrition',
  brand_logo_url TEXT,
  footer_logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#d32f2f',
  secondary_color TEXT NOT NULL DEFAULT '#ffffff',
  favicon_url TEXT,
  seo_title TEXT NOT NULL DEFAULT 'Top Muscle Nutrition - Premium Supplements',
  seo_description TEXT NOT NULL DEFAULT 'Shop premium protein, glucose, and energy drinks. Verify product authenticity and order via WhatsApp.',
  hero_title TEXT NOT NULL DEFAULT 'Fuel Your Performance',
  hero_description TEXT NOT NULL DEFAULT 'Premium quality supplements designed to power your workouts and speed up recovery. Order directly via WhatsApp.',
  hero_bg_type TEXT NOT NULL DEFAULT 'gradient', -- 'gradient' or 'image'
  hero_bg_gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
  hero_bg_image_url TEXT,
  hero_product_image_url TEXT NOT NULL DEFAULT 'hero_product.png',
  hero_product_images JSONB DEFAULT '[]',
  hero_badge_1_text TEXT NOT NULL DEFAULT '100% Genuine',
  hero_badge_1_icon TEXT NOT NULL DEFAULT 'fas fa-shield-halved',
  hero_badge_2_text TEXT NOT NULL DEFAULT 'FSSAI Certified',
  hero_badge_2_icon TEXT NOT NULL DEFAULT 'fas fa-certificate',
  whatsapp_number TEXT NOT NULL DEFAULT '+1234567890',
  contact_email TEXT NOT NULL DEFAULT 'info@topmusclenutrition.com',
  contact_phone TEXT NOT NULL DEFAULT '+1234567890',
  contact_address TEXT NOT NULL DEFAULT '123 Muscle Street, Fitness City',
  google_map_iframe TEXT,
  footer_copyright TEXT NOT NULL DEFAULT '© 2026 Top Muscle Nutrition. All rights reserved.',
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_linkedin TEXT
);

-- Seed initial settings row
INSERT INTO settings (
  id, 
  brand_name, 
  brand_logo_url,
  primary_color, 
  secondary_color, 
  seo_title, 
  seo_description,
  hero_title,
  hero_description,
  hero_product_image_url,
  hero_badge_1_text,
  hero_badge_1_icon,
  hero_badge_2_text,
  hero_badge_2_icon,
  whatsapp_number,
  contact_email,
  contact_phone,
  contact_address,
  footer_copyright
) VALUES (
  1, 
  'Top Muscle Nutrition', 
  'https://hblbnsgwrjmpgjmmhpoy.supabase.co/storage/v1/object/public/images/brand/BrandLogo.png',
  '#d32f2f', 
  '#ffffff', 
  'Top Muscle Nutrition - Premium Supplements', 
  'Shop premium protein, glucose, and energy drinks. Verify product authenticity and order via WhatsApp.',
  'Fuel Your Performance',
  'Premium quality supplements designed to power your workouts and speed up recovery. Order directly via WhatsApp.',
  'hero_product.png',
  '100% Genuine',
  'fas fa-shield-halved',
  'FSSAI Certified',
  'fas fa-certificate',
  '+1234567890',
  'info@topmusclenutrition.com',
  '+1234567890',
  '123 Muscle Street, Fitness City',
  '© 2026 Top Muscle Nutrition. All rights reserved.'
) ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS)
--------------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE authentication_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- RLS POLICIES FOR PUBLIC READ-ONLY ACCESS
--------------------------------------------------------------------------------
CREATE POLICY "Allow public read categories" ON categories 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read products" ON products 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read product_images" ON product_images 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read settings" ON settings 
  FOR SELECT USING (true);

-- NOTE: Public users CANNOT perform SELECT on the authentication_codes table directly.
-- This prevents users from listing all valid unique codes. They must use the verify function instead.

--------------------------------------------------------------------------------
-- RLS POLICIES FOR AUTHENTICATED ADMIN EDIT ACCESS
--------------------------------------------------------------------------------
CREATE POLICY "Allow admin edit categories" ON categories 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin edit products" ON products 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin edit product_images" ON product_images 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin edit authentication_codes" ON authentication_codes 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin edit settings" ON settings 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

--------------------------------------------------------------------------------
-- PRODUCT VERIFICATION FUNCTION (RPC)
--------------------------------------------------------------------------------
-- This runs with SECURITY DEFINER privileges (owner bypasses RLS)
-- allowing public users to query only a single, specific code they possess.
CREATE OR REPLACE FUNCTION verify_product_code(input_code TEXT)
RETURNS TABLE (
  verified BOOLEAN,
  product_name TEXT,
  product_image TEXT,
  manufacturing_date DATE,
  expiry_date DATE,
  status TEXT
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as verified,
    p.title as product_name,
    COALESCE(
      (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1),
      ''
    ) as product_image,
    ac.manufacturing_date,
    ac.expiry_date,
    ac.status
  FROM authentication_codes ac
  JOIN products p ON ac.product_id = p.id
  WHERE ac.unique_code = input_code;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- 6. CREATE REVIEWS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Select policy (only approved reviews are readable by public)
CREATE POLICY "Allow public read approved reviews" ON reviews
  FOR SELECT USING (approved = true);

-- Insert policy (anyone can submit a review)
CREATE POLICY "Allow public insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Admin policy (admin can manage all reviews)
CREATE POLICY "Allow admin manage reviews" ON reviews
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


--------------------------------------------------------------------------------
-- PRODUCT PRICING & WEIGHT SIZES PREFERENCES ALTERATIONS
--------------------------------------------------------------------------------
-- Alter products table to add price, offer_price, variants, and weight columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT;

-- Alter settings table to add weight_sizes column for standard sizes/weights list
ALTER TABLE settings ADD COLUMN IF NOT EXISTS weight_sizes TEXT DEFAULT '500 g, 1 kg, 2 kg, 5 kg';

-- Add homepage visibility toggles to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS show_top_products BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS show_best_sellers BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS show_trending_products BOOLEAN DEFAULT true;

-- Add homepage video sections config to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video1_show BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video1_title TEXT DEFAULT 'About Our Brand';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video1_desc TEXT DEFAULT 'Watch our introduction video to learn how we make our supplements.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video1_type TEXT DEFAULT 'youtube'; -- 'upload' or 'youtube'
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video1_mp4_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video1_youtube_url TEXT;

ALTER TABLE settings ADD COLUMN IF NOT EXISTS video2_show BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video2_title TEXT DEFAULT 'Authentic Verification Guide';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video2_desc TEXT DEFAULT 'See how to use our unique authentication codes to verify your product.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video2_type TEXT DEFAULT 'youtube'; -- 'upload' or 'youtube'
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video2_mp4_url TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS video2_youtube_url TEXT;

-- Add footer logo setting to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS footer_logo_url TEXT;

-- Add new product type flags to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS top_product BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS trending BOOLEAN DEFAULT false;


--------------------------------------------------------------------------------
-- SUPABASE STORAGE BUCKETS & POLICIES SETUP
--------------------------------------------------------------------------------

-- Seed buckets if they do not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies on Storage Objects for upload and download access
DROP POLICY IF EXISTS "Allow public read product-images" ON storage.objects;
CREATE POLICY "Allow public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow admin manage product-images" ON storage.objects;
CREATE POLICY "Allow admin manage product-images" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public read brand-assets" ON storage.objects;
CREATE POLICY "Allow public read brand-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');

DROP POLICY IF EXISTS "Allow admin manage brand-assets" ON storage.objects;
CREATE POLICY "Allow admin manage brand-assets" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'brand-assets') WITH CHECK (bucket_id = 'brand-assets');
