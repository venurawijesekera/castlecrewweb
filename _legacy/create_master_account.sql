-- Add a dedicated, unique Master Account for the System Control Center
INSERT OR IGNORE INTO users (email, password, role, plan, enterprise_id)
VALUES ('root@castlecrew.cc', 'CastleRoot2025!', 'super_admin', 'executive', NULL);
