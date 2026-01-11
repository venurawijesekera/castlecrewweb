SELECT sm.*, u.role as user_role, u.enterprise_id as user_ent_id
FROM support_messages sm
LEFT JOIN users u ON sm.sender_id = u.id
ORDER BY sm.created_at DESC
LIMIT 10;
