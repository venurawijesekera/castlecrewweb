-- Safe Migration for Remote Database
-- This script adds new columns and tables WITHOUT deleting existing data.

-- 1. Create Enterprises Table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS enterprises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    license_count INTEGER DEFAULT 10,
    sub_license_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add Missing Columns to Users Table
-- SQLite requires separate ALTER TABLE commands for each column.
ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'starter';
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN enterprise_id INTEGER;

-- 3. Insert Default Enterprise (Optional, prevents empty list)
INSERT INTO enterprises (name, license_count, sub_license_count) VALUES ('Castle Crew Internal', 100, 0);
