-- Revert user names to match their main profile cards
UPDATE users 
SET full_name = (
    SELECT full_name 
    FROM cards 
    WHERE cards.user_id = users.id 
    AND cards.parent_id IS NULL 
    LIMIT 1
)
WHERE id IN (
    SELECT user_id 
    FROM cards 
    WHERE parent_id IS NULL
);
