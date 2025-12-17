-- Add columns to track edited code and whether it was modified
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS code_applied TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS was_edited BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN tasks.code_applied IS 'The actual code that was committed (may be different from code_suggested if user edited it)';
COMMENT ON COLUMN tasks.was_edited IS 'Whether the developer edited the suggested code before applying';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_was_edited ON tasks(was_edited) WHERE was_edited = TRUE;
