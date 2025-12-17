-- Script para remover e recriar a constraint de role permitindo 'DEV'
-- Este script não valida dados existentes para evitar erros

BEGIN;

-- 1. Primeiro, vamos ver quais roles existem atualmente na tabela
DO $$
BEGIN
    RAISE NOTICE '=== ROLES ATUAIS NA TABELA USERS ===';
END $$;

SELECT DISTINCT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- 2. Remove a constraint antiga sem validar
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 3. Cria uma nova constraint que aceita TODOS os possíveis valores
-- Incluindo os que já existem + o novo 'DEV'
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN (
    'SUPER_ADMIN',
    'ADMIN_CLIENT', 
    'DEV',
    'super_admin',
    'admin',
    'user',
    'client_admin',
    'developer',
    'dev'
));

-- 4. Mostra a constraint criada
DO $$
BEGIN
    RAISE NOTICE '=== CONSTRAINT RECRIADA COM SUCESSO ===';
    RAISE NOTICE 'Valores permitidos: SUPER_ADMIN, ADMIN_CLIENT, DEV, super_admin, admin, user, client_admin, developer, dev';
END $$;

COMMIT;
