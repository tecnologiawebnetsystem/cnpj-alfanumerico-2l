# 🔐 Credenciais do Sistema - Aegis CNPJ Alfanumérico

## Estrutura de Perfis

### 1️⃣ Super Admin (Nível Máximo)
**Acesso total ao sistema**

- **Email:** `superadmin@gmail.com`
- **Senha:** `123@123`
- **Permissões:**
  - ✅ Cadastrar e gerenciar clientes
  - ✅ Cadastrar e gerenciar admins de clientes
  - ✅ Ver todos os dados do sistema
  - ✅ Relatórios analíticos globais
  - ✅ CRUD completo de todas as entidades
  - ✅ Configurações do sistema
  - ✅ Não pertence a nenhum cliente específico

---

### 2️⃣ Admin de Cliente
**Administrador do cliente Aegis Technology**

- **Email:** `kleber.goncalves.1209@gmail.com`
- **Senha:** `Kleber@123`
- **Cliente:** Aegis Technology
- **Permissões:**
  - ✅ Cadastrar e gerenciar DEVs do seu cliente
  - ✅ Criar e atribuir tarefas aos DEVs
  - ✅ Visualizar análises de repositórios (GitHub/GitLab)
  - ✅ Configurar repositórios e variáveis
  - ✅ Gerar e baixar relatórios
  - ✅ Gerenciar status de tarefas
  - ✅ Dashboard com visão geral do cliente
  - ❌ Não pode ver dados de outros clientes

---

### 3️⃣ Desenvolvedores (DEV)
**Usuários que executam tarefas**

#### DEV 1
- **Email:** `dev1@aegistech.com.br`
- **Senha:** `Dev@123`
- **Nome:** João Silva (DEV)
- **Cliente:** Aegis Technology

#### DEV 2
- **Email:** `dev2@aegistech.com.br`
- **Senha:** `Dev@123`
- **Nome:** Maria Santos (DEV)
- **Cliente:** Aegis Technology

**Permissões:**
- ✅ Ver apenas tarefas atribuídas a ele
- ✅ Marcar tarefas como concluídas
- ✅ Registrar tipo de alteração (obrigatório)
- ✅ Informar erros ou conclusão
- ✅ Comentar nas tarefas
- ❌ Não pode criar tarefas
- ❌ Não pode ver tarefas de outros DEVs

---

## Fluxo de Trabalho

```
Super Admin
    │
    ├─> Cadastra Cliente (Aegis Technology)
    │
    └─> Cadastra Admin do Cliente (Kleber)
            │
            ├─> Cadastra DEVs (João, Maria, etc)
            │
            ├─> Cria Tarefas
            │
            └─> Atribui Tarefas aos DEVs
                    │
                    └─> DEV vê tarefas e marca como concluída
```

---

## Hierarquia de Acesso

| Perfil | Cliente | Gerenciar Clientes | Gerenciar Usuários | Criar Tarefas | Ver Tarefas | Dashboard |
|--------|---------|-------------------|-------------------|---------------|-------------|-----------|
| **Super Admin** | - | ✅ Todos | ✅ Todos | ✅ | ✅ Todas | Global |
| **Admin** | Específico | ❌ | ✅ Seu cliente | ✅ | ✅ Seu cliente | Cliente |
| **DEV** | Específico | ❌ | ❌ | ❌ | ✅ Suas tarefas | Minhas Tarefas |

---

## IDs Importantes

```sql
-- Super Admin
User ID: 00000000-0000-0000-0000-000000000001

-- Cliente Aegis Technology
Client ID: 11111111-1111-1111-1111-111111111111

-- Admin Kleber
User ID: 22222222-2222-2222-2222-222222222222

-- DEV João
User ID: 33333333-3333-3333-3333-333333333333

-- DEV Maria
User ID: 44444444-4444-4444-4444-444444444444
```

---

## Notas Importantes

1. **Super Admin não tem client_id** - Tem acesso a todos os clientes
2. **Admin e DEV têm client_id** - Só veem dados do seu cliente
3. **Senhas são criptografadas** com bcrypt
4. **Status padrão** é 'active' para todos os usuários
5. **Role constraint** permite apenas: 'super_admin', 'admin', 'dev'

---

## Executar Scripts

Para criar a estrutura completa, execute:

```bash
npm run db:migrate
# ou
psql $DATABASE_URL -f scripts/990-create-three-tier-system.sql
