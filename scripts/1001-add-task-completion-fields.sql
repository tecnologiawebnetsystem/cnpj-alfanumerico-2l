-- Add commit and PR fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS commit_hash VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pr_number VARCHAR(50);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES users(id);

-- Add UNIQUE constraint on users.email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key' AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;
