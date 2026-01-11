-- Create License Requests Table
CREATE TABLE IF NOT EXISTS license_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enterprise_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    request_type TEXT NOT NULL, -- 'profile' or 'sub'
    amount INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprises(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
