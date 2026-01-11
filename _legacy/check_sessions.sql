SELECT s.user_id, u.email, u.role, u.enterprise_id FROM sessions s JOIN users u ON s.user_id = u.id ORDER BY s.expires_at DESC LIMIT 5;
