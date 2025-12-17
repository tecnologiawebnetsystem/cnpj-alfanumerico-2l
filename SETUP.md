# Guia de Configuração Completa

## Setup Rápido (5 minutos)

### 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização e projeto
3. Aguarde a criação do banco de dados

### 2. Obter Credenciais

No painel do Supabase:
1. Vá em **Settings** → **API**
2. Copie:
   - Project URL
   - anon/public key
   - service_role key (⚠️ mantenha seguro)

### 3. Configurar Variáveis

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

### 4. Executar Scripts SQL

No Supabase, vá em **SQL Editor** e execute em ordem:

1. **Core Tables** (ordem obrigatória):
   ```
   001-create-tables.sql
   002-create-api-tables.sql
   003-create-auth-system.sql
   004-complete-multi-tenant-setup.sql
   ```

2. **Features**:
   ```
   006-simplify-schema-hotfix.sql
   008-add-github-integration.sql
   009-create-integrations-system.sql
   020-add-licensing-system.sql
   100-complete-feature-system.sql
   110-system-settings.sql
   200-create-scrum-system.sql
   ```

3. **Auth Fix** (⚠️ **IMPORTANTE**):
   ```
   999-fix-auth-complete.sql
   ```

### 5. Instalar e Rodar

```bash
npm install
npm run dev
```

## Verificação Pós-Setup

### Teste 1: Banco de Dados
Execute no SQL Editor:

```sql
-- Deve retornar pelo menos 1 usuário
SELECT * FROM users;

-- Deve retornar a função
SELECT * FROM pg_proc WHERE proname = 'verify_user_password';
```

### Teste 2: Login
1. Acesse `http://localhost:3000/login`
2. Use: `kleber.goncalves.1209@gmail.com` / `Kleber@2026`
3. Deve redirecionar para `/dashboard`

### Teste 3: Licença
No dashboard, verifique se não há aviso de licença expirada.

## Problemas Comuns

### ❌ Login retorna "Credenciais inválidas"

**Solução:**
```sql
-- Execute novamente o script de auth
\i scripts/999-fix-auth-complete.sql

-- Verifique se o usuário existe
SELECT email, role, status FROM users 
WHERE email = 'kleber.goncalves.1209@gmail.com';
```

### ❌ "supabase.from is not a function"

**Causa:** `createServerClient()` não está sendo aguardado.

**Solução:** Já corrigido na versão atual. Se ainda ocorrer, certifique-se de ter a última versão.

### ❌ Erro de CORS

**Solução:** Configure no Supabase:
1. **Authentication** → **URL Configuration**
2. Adicione `http://localhost:3000` em Site URL
3. Adicione `http://localhost:3000/**` em Redirect URLs

### ❌ Licença expirada após login

**Solução:**
```sql
-- Ativar licença para o cliente
UPDATE client_licenses 
SET status = 'active',
    expires_at = NOW() + INTERVAL '1 year'
WHERE client_id = (SELECT client_id FROM users WHERE email = 'kleber.goncalves.1209@gmail.com');
```

## Configurações Avançadas

### Habilitar RLS (Row Level Security)

```sql
-- Exemplo para tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id::text);
```

### Adicionar Novo Super Admin

```sql
-- Substituir com email e senha desejados
INSERT INTO users (email, password_hash, name, role, status, client_id)
VALUES (
  'novo@email.com',
  crypt('SuaSenhaSegura', gen_salt('bf')),
  'Nome do Admin',
  'super_admin',
  'active',
  (SELECT id FROM clients LIMIT 1)
);
```

### Backup do Banco

No Supabase:
1. **Database** → **Backups**
2. Configure backups automáticos
3. Ou exporte manualmente via SQL Editor

## Deploy em Produção

### Vercel

1. Push para GitHub
2. Importe no Vercel
3. Configure as mesmas variáveis de ambiente
4. Deploy automático

### Variáveis de Produção

Certifique-se de configurar:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Manutenção

### Limpeza de Dados Antigos

```sql
-- Remover análises antigas (> 6 meses)
DELETE FROM cnpj_analyses 
WHERE created_at < NOW() - INTERVAL '6 months';

-- Limpar logs antigos
DELETE FROM activity_logs 
WHERE created_at < NOW() - INTERVAL '3 months';
```

### Monitoramento

- Verifique uso do banco no painel Supabase
- Configure alertas para limites de queries
- Monitore performance com Vercel Analytics

## Próximos Passos

1. ✅ Sistema funcionando
2. 📝 Criar primeiros CNPJs para análise
3. 👥 Adicionar mais usuários
4. 🎯 Criar primeira sprint
5. 🚀 Deploy em produção
