DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS enterprises;

-- 1. Enterprises Table (New!)
CREATE TABLE enterprises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    license_count INTEGER DEFAULT 10,
    sub_license_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Updated with new columns)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    phone TEXT,              -- Contact phone for staff
    full_name TEXT,
    plan TEXT DEFAULT 'starter', -- 'starter', 'professional', 'executive', 'enterprise'
    role TEXT DEFAULT 'user',    -- 'user', 'admin', 'super_admin'
    enterprise_id INTEGER,       -- Link to enterprises table
    assigned_admin_id INTEGER,   -- Link to the admin who manages this user
    sub_license_count INTEGER DEFAULT 0, -- Quota for their own sub-users (if applicable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sessions Table
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    expires_at INTEGER
);

-- 4. Cards Table
CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    slug TEXT UNIQUE,
    template_id TEXT,
    
    -- Profile Content
    full_name TEXT,
    job_title TEXT,
    company TEXT,
    bio TEXT,
    avatar_url TEXT,
    
    -- Contact Details
    email TEXT,
    phone TEXT,
    website TEXT,
    whatsapp TEXT,
    linkedin TEXT,
    instagram TEXT,
    
    -- Colors/Theme
    accent_color TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a Test Admin User
INSERT INTO users (email, password, role, plan) VALUES ('admin@test.com', '123456', 'admin', 'executive');

-- Insert a Test Enterprise & Super Admin
INSERT INTO enterprises (name, license_count) VALUES ('Acme Corp', 50);
INSERT INTO users (email, password, role, plan, enterprise_id) VALUES ('ceo@acmecorp.com', '123456', 'super_admin', 'enterprise', 1);

-- Insert a Test Individual User
INSERT INTO users (email, password, role, plan) VALUES ('john@doe.com', '123456', 'user', 'professional');

-- Insert a Test Card for the main admin
INSERT INTO cards (user_id, slug, template_id, full_name, job_title, company, email, phone) 
VALUES (1, 'demo', 'executive', 'Test Admin', 'System Admin', 'Castle Crew', 'admin@castlecrew.com', '+1234567890');

-- Insert a Test Card for the Individual User
INSERT INTO cards (user_id, slug, template_id, full_name, job_title, company, email, phone) 
VALUES (3, 'johndoe', 'creative', 'John Doe', 'Designer', 'Freelance', 'john@doe.com', '+9876543210');