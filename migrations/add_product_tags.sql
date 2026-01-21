-- Migration: Add tags column to products table
ALTER TABLE products ADD COLUMN tags TEXT DEFAULT '[]';
