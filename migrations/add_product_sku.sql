-- Migration: Add SKU column to products table
ALTER TABLE products ADD COLUMN sku TEXT;

-- Create unique index on SKU to prevent duplicates
CREATE UNIQUE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
