-- Migration to add new columns to users table
-- Run this against your remote D1 database

-- ALTER TABLE users ADD COLUMN phone TEXT; -- Exists already
ALTER TABLE users ADD COLUMN sub_license_count INTEGER DEFAULT 0;
-- full_name and assigned_admin_id might already be there from previous edits/migrations, 
-- but ensuring they are consistent. If they exist, these specific lines might fail or be ignored depending on engine.
-- SQLite ALTER TABLE ADD COLUMN does not support IF NOT EXISTS in standard syntax universally, 
-- but D1 usually handles sequential migrations.

-- Use these if you are sure they don't exist, otherwise comment them out:
-- ALTER TABLE users ADD COLUMN full_name TEXT; 
-- ALTER TABLE users ADD COLUMN assigned_admin_id INTEGER;
