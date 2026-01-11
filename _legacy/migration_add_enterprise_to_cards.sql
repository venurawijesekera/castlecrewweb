ALTER TABLE cards ADD COLUMN enterprise_id INTEGER;
-- Backfill existing cards with enterprise_id from their owners
-- Note: SQLite might not support JOIN in UPDATE easily in all versions, using correlated subquery
UPDATE cards SET enterprise_id = (SELECT enterprise_id FROM users WHERE users.id = cards.user_id);
