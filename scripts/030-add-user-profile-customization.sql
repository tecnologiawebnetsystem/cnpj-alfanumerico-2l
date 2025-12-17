-- Add user profile customization fields
-- Adds avatar_url, theme_color, theme_preferences to users table
-- Adds profile_updated_at timestamp

ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS theme_preferences JSONB DEFAULT '{"mode": "light", "sidebar": "expanded"}'::jsonb,
ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster profile queries
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_url) WHERE avatar_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile avatar image (stored in Vercel Blob or similar)';
COMMENT ON COLUMN users.theme_color IS 'Primary theme color preference (blue, purple, green, orange, etc.)';
COMMENT ON COLUMN users.theme_preferences IS 'JSON object with theme settings like dark mode, sidebar state, etc.';
COMMENT ON COLUMN users.profile_updated_at IS 'Timestamp of last profile update';
