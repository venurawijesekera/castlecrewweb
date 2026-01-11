ALTER TABLE cards ADD COLUMN parent_id INTEGER;
-- Also add title and description columns as they are used in some API logic
ALTER TABLE cards ADD COLUMN title TEXT;
ALTER TABLE cards ADD COLUMN description TEXT;
