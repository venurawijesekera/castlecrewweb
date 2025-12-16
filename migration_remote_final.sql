-- Final Safe Migration
-- Only adding the one missing column found in diagnostics.

ALTER TABLE enterprises ADD COLUMN sub_license_count INTEGER DEFAULT 0;
