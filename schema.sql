DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS sessions;

-- 1. Users Table (Login Info)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT, -- In a real app, we hash this!
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sessions Table (To keep them logged in)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    expires_at INTEGER
);

-- 3. Cards Table (The Digital Card Data)
CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    slug TEXT UNIQUE, -- This is for castlecrew.com/p/venura
    template_id TEXT, -- 'executive', 'creative', 'realestate'
    
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

-- Insert a Test User (Email: admin@test.com, Pass: 123456)
INSERT INTO users (email, password) VALUES ('admin@test.com', '123456');

-- Insert a Test Card for that user
INSERT INTO cards (user_id, slug, template_id, full_name, job_title, company, email, phone) 
VALUES (1, 'demo', 'executive', 'Test User', 'CEO', 'Castle Crew', 'hello@castlecrew.com', '+9477123456');