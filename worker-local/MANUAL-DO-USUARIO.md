# 📖 Manual do Usuário - Worker Local

## 🎯 O que é o Worker Local?

O Worker Local é um programa que roda no seu computador e analisa repositórios de código **10x mais rápido** do que a análise via internet (Cloud).

### Como funciona?

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Você cria      │      │  Worker Local    │      │  Resultados no  │
│  análise no     │ ───▶ │  clona e analisa │ ───▶ │  Dashboard Web  │
│  Dashboard Web  │      │  em C:\Projetos  │      │  automaticamente│
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

---

## 📥 Instalação (SUPER FÁCIL)

### Pré-requisitos

✅ **Node.js** - Se não tiver, o instalador oferece baixar automaticamente

### Passo a Passo

1. **Clique com botão direito** em `INSTALAR-WORKER.bat`
2. Selecione **"Executar como administrador"**
3. Siga as instruções na tela (o instalador faz tudo sozinho!)
4. Quando pedir credenciais, copie do sistema web

---

## 🚀 Como Usar

### Iniciar o Worker

**Opção 1: Atalho na Área de Trabalho**
- Duplo clique em `Worker Local.bat`

**Opção 2: Menu Iniciar**
- Procure por "Worker Local"

**Opção 3: Manual**
```
C:\WorkerLocal\INICIAR-WORKER.bat
```

### Você verá uma tela assim:

```
Worker Local iniciado
Monitorando jobs...
✅ Worker online e conectado ao sistema
```

**⚠️ IMPORTANTE: Deixe essa janela aberta enquanto usa o sistema!**

---

## 🖥️ Usando no Dashboard Web

### 1. Acesse o Dashboard

Entre no sistema web normalmente

### 2. Verifique se o Worker está Online

No topo da página, procure:

```
🟢 Worker Online    ← Verde = Pode usar análise local
🟡 Worker Offline   ← Amarelo = Use análise Cloud
```

### 3. Crie uma Nova Análise

1. Vá em **Análises** → **Nova Análise**
2. Selecione provedor e repositórios normalmente
3. **IMPORTANTE:** Escolha o método:

```
┌──────────────────────────────────────────────┐
│ ⚪ Análise via Cloud (API)                   │
│    Funciona sempre, mais lento               │
│                                              │
│ 🔵 Análise Local (Mais Rápido) 🟢          │
│    Clona em C:\Projetos                     │
│    Requer Worker rodando                    │
└──────────────────────────────────────────────┘
```

4. Clique em **"Iniciar Análise"**

### 4. Acompanhe o Progresso

- O Worker clona os repositórios automaticamente
- Você pode ver os arquivos aparecendo em `C:\Projetos\`
- Logs aparecem na janela do Worker
- Dashboard atualiza o progresso automaticamente

---

## 📁 Onde ficam os arquivos?

```
C:\
├── WorkerLocal\              ← Instalação do Worker
│   ├── src\                  ← Código do Worker
│   ├── logs\                 ← Logs de execução
│   ├── .env                  ← Credenciais (NÃO COMPARTILHE!)
│   └── INICIAR-WORKER.bat    ← Para iniciar
│
└── Projetos\                 ← Repositórios clonados
    ├── Projeto1\
    │   ├── repo1\
    │   └── repo2\
    └── Projeto2\
        └── repo3\
```

---

## ❓ Perguntas Frequentes

### ❓ O Worker precisa ficar rodando sempre?

**R:** Apenas quando você for fazer análises locais. Pode fechar quando não estiver usando.

### ❓ Posso usar o computador enquanto o Worker roda?

**R:** Sim! O Worker roda em segundo plano e não atrapalha.

### ❓ E se eu fechar a janela por acidente?

**R:** Basta executar `INICIAR-WORKER.bat` novamente. Ele continua de onde parou.

### ❓ Preciso ter conhecimento técnico?

**R:** Não! O instalador faz tudo automaticamente.

### ❓ Posso deletar os repositórios de C:\Projetos?

**R:** Sim, depois que a análise terminar. O Worker clona novamente quando precisar.

### ❓ O que significa "Worker Offline" no dashboard?

**R:** O Worker não está rodando. Execute `INICIAR-WORKER.bat` para iniciar.

---

## 🆘 Resolução de Problemas

### Problema: "Worker Offline" mesmo com Worker rodando

**Solução:**
1. Verifique se o arquivo `.env` tem as credenciais corretas
2. Teste a conexão com internet
3. Reinicie o Worker

### Problema: Erro ao clonar repositório

**Solução:**
1. Verifique se tem espaço em disco em `C:\`
2. Confira se o token do Azure DevOps está válido
3. Veja os logs em `C:\WorkerLocal\logs\worker.log`

### Problema: Node.js não encontrado

**Solução:**
1. Baixe em: https://nodejs.org/
2. Instale a versão LTS
3. Reinicie o instalador

### Problema: Análise muito lenta

**Solução:**
1. Use análise Local (não Cloud)
2. Verifique se Worker está rodando
3. Libere espaço em `C:\Projetos\`

---

## 📞 Suporte

### Logs
Sempre verifique os logs primeiro:
```
C:\WorkerLocal\logs\worker.log
```

### Informações Úteis para Suporte

Quando pedir ajuda, informe:
- Versão do Node.js: `node --version`
- Sistema operacional: Windows 10/11
- Mensagem de erro dos logs
- O que estava tentando fazer

---

## 🔄 Desinstalação

Se precisar remover:

1. Feche o Worker
2. Delete a pasta `C:\WorkerLocal`
3. Delete a pasta `C:\Projetos` (opcional)
4. Delete o atalho da Área de Trabalho

---

## ✅ Checklist de Uso Diário

- [ ] Iniciei o Worker (`INICIAR-WORKER.bat`)
- [ ] Verifiquei o indicador "Worker Online" no dashboard
- [ ] Selecionei "Análise Local" ao criar análise
- [ ] Deixei a janela do Worker aberta durante a análise
- [ ] Verifiquei os logs se houver problemas

---

**Versão do Manual:** 1.0  
**Última Atualização:** 2025
