-- Add missing columns for product cards
ALTER TABLE cards ADD COLUMN title TEXT;
ALTER TABLE cards ADD COLUMN description TEXT;
ALTER TABLE cards ADD COLUMN theme TEXT;
