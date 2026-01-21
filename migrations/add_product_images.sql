-- Migration: Add images column to products table
ALTER TABLE products ADD COLUMN images TEXT;

-- Update existing products to convert image_url to images array
UPDATE products SET images = json_array(image_url) WHERE image_url IS NOT NULL AND image_url != '';
