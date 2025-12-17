-- Drop the incorrect foreign key constraint
ALTER TABLE analyses 
DROP CONSTRAINT IF EXISTS analyses_connection_id_fkey;

-- Add the correct foreign key constraint pointing to github_tokens
ALTER TABLE analyses 
ADD CONSTRAINT analyses_connection_id_fkey 
FOREIGN KEY (connection_id) 
REFERENCES github_tokens(id) 
ON DELETE SET NULL;

-- Verify the constraint was created
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    rel.relname AS table_name,
    att.attname AS column_name,
    ns.nspname AS schema_name,
    rel2.relname AS referenced_table
FROM pg_constraint con
JOIN pg_class rel ON con.conrelid = rel.oid
JOIN pg_namespace ns ON rel.relnamespace = ns.oid
JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = ANY(con.conkey)
LEFT JOIN pg_class rel2 ON con.confrelid = rel2.oid
WHERE con.conname = 'analyses_connection_id_fkey'
    AND ns.nspname = 'public';
