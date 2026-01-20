-- Add hours tracking fields to tasks table (like Azure DevOps)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_hours DECIMAL(5,2) DEFAULT 0;

-- Add AI suggestion field if not exists
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS ai_suggestion TEXT;

-- Update remaining_hours to match estimated_hours for existing tasks
UPDATE tasks SET remaining_hours = estimated_hours WHERE remaining_hours = 0 AND estimated_hours > 0;
