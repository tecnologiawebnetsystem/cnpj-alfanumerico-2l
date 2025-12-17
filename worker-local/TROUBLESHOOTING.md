# 🔧 Guia de Troubleshooting - Worker Local

## 🚨 Problemas Comuns e Soluções

### 1. Erro: "Node.js não encontrado"

**Sintoma:**
```
'node' não é reconhecido como um comando interno ou externo
```

**Causa:** Node.js não está instalado

**Solução:**
1. Acesse https://nodejs.org/
2. Baixe a versão **LTS (Long Term Support)**
3. Execute o instalador
4. Marque a opção "Add to PATH" durante instalação
5. Reinicie o computador
6. Execute o instalador do Worker novamente

---

### 2. Erro: "Worker Offline" no dashboard

**Sintoma:** Indicador amarelo "Worker Offline" mesmo com Worker rodando

**Possíveis Causas e Soluções:**

#### Causa A: Credenciais incorretas no .env

**Verificar:**
```bat
notepad C:\WorkerLocal\.env
```

**Deve conter:**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Solução:**
- Copie as credenciais corretas do dashboard web
- Salve o arquivo `.env`
- Reinicie o Worker

#### Causa B: Firewall bloqueando

**Solução:**
1. Abra "Firewall do Windows"
2. Clique em "Permitir um aplicativo"
3. Adicione `node.exe` à lista de permitidos
4. Reinicie o Worker

#### Causa C: Problema de rede

**Testar conexão:**
```bat
ping supabase.co
```

---

### 3. Erro ao clonar repositório

**Sintoma:**
```
Error: Authentication failed
```

**Solução:**

#### Para Azure DevOps:
1. Verifique se o PAT (Personal Access Token) está válido
2. Acesse Azure DevOps → User Settings → Personal Access Tokens
3. Gere um novo token com permissões de leitura
4. Atualize no arquivo `.env`:
```
AZURE_DEVOPS_PAT=seu_novo_token_aqui
```
5. Reinicie o Worker

---

### 4. Disco cheio / Sem espaço

**Sintoma:**
```
ENOSPC: no space left on device
```

**Solução:**

#### Opção 1: Limpar repositórios antigos
```bat
del /s /q C:\Projetos\*
```

#### Opção 2: Mudar local dos projetos
1. Edite `.env`:
```
PROJECTS_DIR=D:\Projetos
```
2. Crie a pasta: `mkdir D:\Projetos`
3. Reinicie o Worker

---

### 5. Worker não processa jobs

**Sintoma:** Worker rodando mas análises não iniciam

**Verificações:**

#### 1. Verificar banco de dados
Acesse o Supabase e execute:
```sql
SELECT * FROM worker_jobs WHERE status = 'pending' LIMIT 5;
```

Se vazio → Problema no dashboard (análise não está sendo criada)
Se cheio → Problema no Worker

#### 2. Verificar logs
```bat
notepad C:\WorkerLocal\logs\worker.log
```

Procure por erros e mensagens

#### 3. Reiniciar Worker
- Feche a janela do Worker
- Execute `INICIAR-WORKER.bat` novamente

---

### 6. Erro: "Permission denied"

**Sintoma:**
```
EACCES: permission denied
```

**Solução:**

#### Opção 1: Executar como Administrador
1. Clique com botão direito em `INICIAR-WORKER.bat`
2. Selecione "Executar como administrador"

#### Opção 2: Dar permissões à pasta
1. Clique com botão direito em `C:\WorkerLocal`
2. Propriedades → Segurança
3. Adicione seu usuário com "Controle Total"

---

### 7. Análise muito lenta

**Otimizações:**

#### 1. Verifique antivírus
- Adicione `C:\Projetos\` às exclusões
- Adicione `C:\WorkerLocal\` às exclusões

#### 2. Use SSD
- Mova `C:\Projetos` para disco SSD se disponível

#### 3. Aumente concorrência
Edite `src/index.js`:
```javascript
const MAX_CONCURRENT = 5; // Padrão: 3
```

---

### 8. Erro: "Module not found"

**Sintoma:**
```
Error: Cannot find module 'simple-git'
```

**Causa:** Dependências não instaladas

**Solução:**
```bat
cd C:\WorkerLocal
npm install
```

---

### 9. Git não instalado

**Sintoma:**
```
Error: git command not found
```

**Solução:**
1. Baixe Git: https://git-scm.com/download/win
2. Instale com opções padrão
3. Reinicie o computador
4. Teste: `git --version`
5. Reinicie o Worker

---

### 10. Worker trava / não responde

**Sintomas:**
- Janela congelada
- Nenhum log aparece
- CPU 100%

**Soluções:**

#### 1. Reinício forçado
1. Pressione `Ctrl + C` na janela do Worker
2. Se não funcionar, feche a janela
3. Abra Gerenciador de Tarefas (`Ctrl + Shift + Esc`)
4. Finalize processo `node.exe`
5. Reinicie Worker

#### 2. Limpar cache
```bat
cd C:\WorkerLocal
rmdir /s /q node_modules
npm install
```

---

## 📊 Códigos de Erro Comuns

| Código | Significado | Solução |
|--------|-------------|---------|
| ENOENT | Arquivo não encontrado | Verifique caminhos no .env |
| EACCES | Permissão negada | Execute como Admin |
| ENOSPC | Disco cheio | Libere espaço |
| ETIMEDOUT | Timeout de rede | Verifique internet |
| ECONNREFUSED | Conexão recusada | Verifique credenciais |

---

## 🔍 Como Ler os Logs

### Localização:
```
C:\WorkerLocal\logs\worker.log
```

### Formato:
```
[2025-01-20T10:30:45.123Z] [INFO] Worker Local iniciado
[2025-01-20T10:30:46.456Z] [SUCCESS] Conectado ao Supabase
[2025-01-20T10:30:50.789Z] [ERROR] Erro ao clonar: Authentication failed
```

### Níveis de Log:
- **INFO** = Informação normal
- **SUCCESS** = Operação bem-sucedida
- **ERROR** = Erro que precisa atenção

---

## 🆘 Quando Pedir Suporte

Se nenhuma solução acima funcionou, envie:

1. **Logs completos:**
   - Arquivo `C:\WorkerLocal\logs\worker.log`

2. **Informações do sistema:**
```bat
node --version
npm --version
git --version
systeminfo | findstr /C:"OS"
```

3. **Conteúdo do .env (SEM MOSTRAR AS CHAVES!):**
```
SUPABASE_URL=[URL presente? Sim/Não]
SUPABASE_SERVICE_ROLE_KEY=[Chave presente? Sim/Não]
```

4. **Descrição do problema:**
   - O que você estava fazendo?
   - Qual erro apareceu?
   - Já tentou reiniciar?

---

## ✅ Checklist de Diagnóstico

Antes de pedir ajuda, verifique:

- [ ] Node.js instalado (`node --version`)
- [ ] Git instalado (`git --version`)
- [ ] Arquivo `.env` existe e tem credenciais
- [ ] Worker está rodando
- [ ] Tem espaço em disco
- [ ] Internet funcionando
- [ ] Firewall não está bloqueando
- [ ] Antivírus não está interferindo
- [ ] Já tentou reiniciar o Worker
- [ ] Verificou os logs

---

**Este guia resolve 99% dos problemas!** 🎯
