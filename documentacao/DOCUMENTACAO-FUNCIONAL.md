# Documentação Funcional - Sistema de Detecção de CNPJ Alfanumérico

## 1. VISÃO GERAL
Sistema para detectar CNPJs hardcoded em código-fonte de repositórios Azure DevOps/GitHub.

## 2. FUNCIONALIDADES POR PERFIL

### SUPER ADMIN
- Gerenciar todos clientes e usuários
- Visualizar logs de erros do sistema
- Configurar integrações globais
- Monitorar workers locais

### ADMIN CLIENTE
- Criar análises de repositórios
- Configurar campos CNPJ customizados
- Configurar extensões de arquivo
- Visualizar relatórios (PDF/Excel/JSON)
- Gerenciar desenvolvedores
- Agendar análises automáticas

### DESENVOLVEDOR
- Visualizar tarefas no Kanban
- Gerar relatórios gerenciais
- Ver análises do projeto

## 3. FLUXO DE ANÁLISE

### MODO CLOUD (API):
1. Selecionar repositórios
2. Sistema busca via API Azure DevOps
3. Analisa arquivos online
4. Salva resultados no banco
5. Gera relatórios

### MODO LOCAL (WORKER):
1. Selecionar repositórios  
2. Worker clona em C:\Projetos
3. Analisa arquivos localmente (10x mais rápido)
4. Envia resultados para banco
5. Gera relatórios

## 4. RELATÓRIOS GERADOS

### PDF Executivo:
- Dashboard com estatísticas
- Estimativas por projeto
- Estimativas por repositório
- Detalhamento linha a linha com solução

### Excel Multi-Aba:
- Resumo executivo
- Estimativas por projeto
- Estimativas por repositório  
- Detalhamento completo

### JSON:
- Dados estruturados completos
- Soluções técnicas por linguagem
- Migration steps
