# Guia de Integrações

Este documento explica como configurar integrações com provedores de repositórios.

## Visão Geral

O sistema permite que você configure integrações com diferentes provedores de repositórios (GitHub, GitLab, Azure DevOps) através da interface web, sem necessidade de configurar variáveis de ambiente.

## Provedores Suportados

### GitHub (Ativo)

Para integrar com o GitHub, você precisa de um **Personal Access Token (PAT)**.

#### Como obter um Personal Access Token do GitHub:

1. **Acesse as configurações do GitHub**
   - Vá para: https://github.com/settings/tokens
   - Ou navegue: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Gere um novo token**
   - Clique em "Generate new token" → "Generate new token (classic)"

3. **Configure as permissões**
   - Dê um nome descritivo (ex: "Análise de Repositórios")
   - Selecione os seguintes escopos:
     - `repo` - Acesso completo aos repositórios privados
     - `read:user` - Ler informações do perfil do usuário

4. **Copie o token**
   - Clique em "Generate token"
   - **IMPORTANTE**: Copie o token imediatamente, pois ele só será exibido uma vez!

5. **Configure na interface**
   - Vá para Dashboard → Integrações
   - Clique em "Nova Integração"
   - Selecione "GitHub"
   - Cole o token no campo "Access Token"

### GitLab (Em Desenvolvimento)

A integração com GitLab está em desenvolvimento e estará disponível em breve.

### Azure DevOps (Em Desenvolvimento)

A integração com Azure DevOps está em desenvolvimento e estará disponível em breve.

## Segurança

- Todos os tokens são criptografados antes de serem armazenados no banco de dados
- Os tokens são descriptografados apenas quando necessário para fazer requisições
- Nunca compartilhe seus tokens de acesso

## Variáveis de Ambiente

A única variável de ambiente necessária é:

- `INTEGRATION_ENCRYPTION_KEY` - Chave de 32 caracteres para criptografar tokens (opcional, tem valor padrão)

**Nota**: Se você não configurar esta variável, o sistema usará uma chave padrão. Para produção, é recomendado configurar uma chave única.

## Uso

Após configurar uma integração:

1. Vá para Dashboard → Nova Análise
2. Clique em "Selecionar do GitHub"
3. Escolha os repositórios que deseja analisar
4. O sistema usará automaticamente a integração configurada
