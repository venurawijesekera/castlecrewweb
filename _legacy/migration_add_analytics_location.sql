-- Add location columns to analytics table
ALTER TABLE analytics ADD COLUMN country TEXT;
ALTER TABLE analytics ADD COLUMN city TEXT;
ALTER TABLE analytics ADD COLUMN latitude REAL;
ALTER TABLE analytics ADD COLUMN longitude REAL;
