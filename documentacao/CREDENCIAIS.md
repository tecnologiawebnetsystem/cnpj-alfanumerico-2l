# 🔐 Credenciais de Login - Sistema Aegis CNPJ Alfanumérico

## 📋 Estrutura de Alçadas (Níveis de Acesso)

O sistema possui 3 níveis hierárquicos de acesso:

---

## 1️⃣ SUPER ADMIN (Controle Total do Sistema)

**Perfil:** Administrador do sistema com acesso total
**Permissões:** 
- Gerenciar todos os clientes
- Criar, editar e deletar clientes
- Visualizar dados de todos os clientes
- Gerenciar configurações globais do sistema
- Acessar todas as funcionalidades sem restrição

### Credenciais:

**Email:** `admin@aegis.com`  
**Senha:** `Admin@2026`  
**Role:** `super_admin`  
**Cliente:** Nenhum (acesso global)

**Script de criação:** `scripts/996-create-super-admin-user.sql`

---

## 2️⃣ ADMIN DE CLIENTE (Administrador do Cliente)

**Perfil:** Administrador dentro de um cliente específico
**Permissões:**
- Gerenciar usuários do seu cliente
- Visualizar e editar dados apenas do seu cliente
- Acessar relatórios e análises do cliente
- Configurar integrações do cliente
- Gerenciar sprints e projetos Scrum/Agile

### Credenciais:

**Email:** `kleber.goncalves.1209@gmail.com`  
**Senha:** `Kleber@2026`  
**Role:** `admin`  
**Cliente:** Aegis Technology

**Script de criação:** 
- `scripts/013-add-kleber-user-simple.sql` (cria usuário)
- `scripts/998-update-kleber-to-client-admin.sql` (associa ao cliente)

---

## 3️⃣ USUÁRIO DE CLIENTE (Usuário Normal)

**Perfil:** Usuário normal dentro de um cliente
**Permissões:**
- Visualizar dados do seu cliente (somente leitura em alguns casos)
- Acessar suas próprias tarefas e projetos
- Participar de sprints e boards Scrum
- Funcionalidades limitadas conforme configuração do admin

### Credenciais:

**⚠️ IMPORTANTE:** Ainda não existe um usuário comum cadastrado no sistema.

Para criar um usuário comum, execute o script abaixo:

```sql
-- Script para criar usuário comum de exemplo
DO $$
DECLARE
  v_client_id uuid;
BEGIN
  -- Buscar o cliente Aegis Technology
  SELECT id INTO v_client_id FROM clients WHERE name = 'Aegis Technology' LIMIT 1;
  
  -- Criar usuário comum
  INSERT INTO users (
    email,
    password_hash,
    name,
    role,
    client_id,
    status
  ) VALUES (
    'usuario@aegistech.com.br',
    crypt('Usuario@2026', gen_salt('bf', 10)),
    'Usuário Teste',
    'user',
    v_client_id,
    'active'
  );
  
  RAISE NOTICE 'Usuário comum criado com sucesso!';
END $$;
```

**Depois de executar o script acima:**

**Email:** `usuario@aegistech.com.br`  
**Senha:** `Usuario@2026`  
**Role:** `user`  
**Cliente:** Aegis Technology

---

## 📊 Resumo das Diferenças

| Nível | Email | Role | Cliente | Pode gerenciar clientes? | Pode gerenciar usuários? | Acesso global? |
|-------|-------|------|---------|--------------------------|-------------------------|----------------|
| **Super Admin** | admin@aegis.com | `super_admin` | Nenhum | ✅ Sim | ✅ Todos | ✅ Sim |
| **Admin Cliente** | kleber.goncalves.1209@gmail.com | `admin` | Aegis Technology | ❌ Não | ✅ Do seu cliente | ❌ Não |
| **Usuário** | usuario@aegistech.com.br | `user` | Aegis Technology | ❌ Não | ❌ Não | ❌ Não |

---

## 🔄 Scripts Necessários para Setup Completo

Execute os scripts nesta ordem:

1. `scripts/997-fix-user-roles-structure.sql` - Estrutura de roles
2. `scripts/996-create-super-admin-user.sql` - Criar super admin
3. `scripts/013-add-kleber-user-simple.sql` - Criar usuário Kleber
4. `scripts/998-update-kleber-to-client-admin.sql` - Transformar Kleber em admin de cliente
5. Script acima (criar usuário comum) - Opcional

---

## 🎯 Qual usar para que?

### Use SUPER ADMIN quando:
- Precisa criar um novo cliente
- Precisa gerenciar configurações globais
- Precisa acessar dados de múltiplos clientes
- Precisa fazer manutenção no sistema

### Use ADMIN DE CLIENTE quando:
- Está gerenciando um cliente específico
- Precisa adicionar usuários ao seu cliente
- Quer gerenciar sprints e projetos do seu cliente
- Precisa configurar integrações

### Use USUÁRIO quando:
- É um colaborador normal
- Precisa executar tarefas diárias
- Participa de sprints mas não gerencia
- Não precisa de permissões administrativas

---

## ⚠️ Notas de Segurança

- **SEMPRE troque as senhas padrão** após o primeiro login
- Senhas devem ter no mínimo 8 caracteres
- Use senhas fortes com maiúsculas, minúsculas, números e símbolos
- Não compartilhe credenciais de super admin
- Crie usuários específicos para cada pessoa

---

## 🔧 Troubleshooting

### "Credenciais inválidas" ao fazer login:
1. Verifique se executou o script `999-fix-auth-complete.sql`
2. Confirme que a senha está correta (case-sensitive)
3. Execute o script `995-check-kleber-user-status.sql` para verificar status

### Página em branco após login:
1. Verifique os logs do console (F12)
2. Confirme que o usuário tem `status = 'active'`
3. Para admin de cliente, confirme que o `client_id` está correto

### Usuário sem permissões:
1. Verifique o `role` na tabela `users`
2. Para `admin` e `user`, confirme que o `client_id` não é NULL
3. Para `super_admin`, confirme que o `client_id` é NULL
