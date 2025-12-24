# Sistema de Alçadas (Permissões)

## Estrutura de Roles

O sistema possui 3 níveis principais de permissão:

### 1. Super Admin (`super_admin`)
**Usuário fixo com controle total do sistema**

**Credenciais:**
- Email: `admin@aegis.com`
- Senha: `Admin@2026`

**Permissões:**
- Gerenciar todos os clientes
- Criar, editar e excluir clientes
- Visualizar dados de todos os clientes
- Gerenciar usuários de todos os clientes
- Acesso completo a todas as funcionalidades
- Não está vinculado a nenhum cliente (`client_id = NULL`)

**Dashboard:**
- Aba "Clientes" exclusiva
- Visão global de todos os clientes
- Estatísticas consolidadas

---

### 2. Admin do Cliente (`admin`)
**Administrador dentro de um cliente específico**

**Permissões:**
- Gerenciar usuários do seu cliente
- Criar e gerenciar análises
- Configurar integrações (GitHub, GitLab, etc.)
- Gerenciar conexões de banco de dados
- Visualizar relatórios e estatísticas do cliente
- Gerenciar API keys
- **Vinculado a um cliente específico** (`client_id != NULL`)

**Dashboard:**
- Todas as abas exceto "Clientes"
- Visão limitada ao seu cliente

---

### 3. Usuário do Cliente (`user`)
**Usuário final dentro de um cliente**

**Permissões:**
- Visualizar análises do cliente
- Visualizar tarefas atribuídas
- Acesso limitado a funcionalidades
- **Vinculado a um cliente específico** (`client_id != NULL`)

**Dashboard:**
- Visão limitada
- Somente leitura na maioria das funcionalidades

---

### 4. Desenvolvedor (`dev`)
**Role especial para desenvolvedores**

**Permissões:**
- Visualizar tarefas atribuídas
- Atualizar status de tarefas
- Visualizar análises relacionadas
- Acesso limitado e focado em desenvolvimento

---

## Criando Usuários

### Super Admin (já existe)
```sql
-- Já criado no script 996-create-super-admin-user.sql
-- Email: admin@aegis.com
-- Senha: Admin@2026
```

### Admin de Cliente
```sql
-- 1. Primeiro, criar o cliente (se não existir)
INSERT INTO clients (name, slug, status, plan)
VALUES ('Minha Empresa', 'minha-empresa', 'active', 'professional');

-- 2. Criar o admin do cliente
INSERT INTO users (email, password_hash, name, role, client_id, status)
VALUES (
  'admin@minhaempresa.com',
  crypt('SenhaSegura@2024', gen_salt('bf', 10)),
  'Admin da Empresa',
  'admin',
  (SELECT id FROM clients WHERE slug = 'minha-empresa'),
  'active'
);
```

### Usuário de Cliente
```sql
INSERT INTO users (email, password_hash, name, role, client_id, status)
VALUES (
  'usuario@minhaempresa.com',
  crypt('SenhaUsuario@2024', gen_salt('bf', 10)),
  'Usuário Normal',
  'user',
  (SELECT id FROM clients WHERE slug = 'minha-empresa'),
  'active'
);
```

---

## Verificando Permissões no Código

```typescript
// No componente ou página
const user = getCurrentUser()

// Verificar role
const isSuperAdmin = user?.role === 'super_admin'
const isClientAdmin = user?.role === 'admin'
const isUser = user?.role === 'user'
const isDev = user?.role === 'dev'

// Verificar se tem client_id
const hasClient = user?.client_id !== null

// Renderizar baseado no role
if (isSuperAdmin) {
  // Mostrar funcionalidades de super admin
} else if (isClientAdmin) {
  // Mostrar funcionalidades de admin do cliente
} else if (isUser) {
  // Mostrar funcionalidades limitadas
}
```

---

## Migração de Usuários Existentes

Para migrar usuários existentes:

```sql
-- Promover usuário para super admin
UPDATE users
SET role = 'super_admin', client_id = NULL
WHERE email = 'email@exemplo.com';

-- Converter usuário para admin de cliente
UPDATE users
SET role = 'admin', client_id = (SELECT id FROM clients WHERE slug = 'cliente-slug')
WHERE email = 'email@exemplo.com';

-- Converter para usuário normal
UPDATE users
SET role = 'user', client_id = (SELECT id FROM clients WHERE slug = 'cliente-slug')
WHERE email = 'email@exemplo.com';
