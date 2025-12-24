# 📁 Estrutura Completa do Projeto

Este repositório contém **2 projetos** no mesmo repositório:

## 🌐 Projeto Web (Next.js) - RAIZ DO REPOSITÓRIO

Localização: **Pasta raiz** (onde você está agora deve subir um nível)

```
/
├── app/                          ← Páginas Next.js (login, dashboard, admin, etc.)
│   ├── login/
│   ├── dashboard/
│   ├── admin/
│   ├── analyzer/
│   └── api/                      ← +180 rotas de API
├── components/                   ← Componentes React
│   ├── dashboard/
│   ├── ui/
│   └── ...
├── lib/                          ← Bibliotecas e helpers
│   ├── supabase/
│   └── utils/
├── public/                       ← Arquivos estáticos
├── scripts/                      ← Scripts SQL
├── package.json                  ← Dependências Next.js
├── next.config.mjs              ← Configuração Next.js
├── tsconfig.json                ← TypeScript config
└── ESPECIFICACAO-TECNICA.md     ← Documentação técnica
```

## 🖥️ Projeto Desktop (WPF) - PASTA wpf-desktop/

Localização: **wpf-desktop/** (essa pasta que você está vendo)

```
wpf-desktop/
├── src/
│   ├── CNPJAnalyzer.Desktop/        ← UI WPF (Views, ViewModels)
│   ├── CNPJAnalyzer.Core/           ← Domain (Entities, Interfaces)
│   ├── CNPJAnalyzer.Application/    ← Use Cases (Serviços)
│   └── CNPJAnalyzer.Infrastructure/ ← Database, Repositories
├── tests/
│   └── CNPJAnalyzer.Tests/          ← Testes unitários
├── CNPJAnalyzer.Desktop.sln         ← Solution Visual Studio
├── ARCHITECTURE.md                  ← Arquitetura WPF
└── README.md                        ← Documentação WPF
```

## 🔍 Como Visualizar Tudo no File Explorer

**Você está vendo APENAS a pasta wpf-desktop/**

Para ver o projeto completo:

1. **Clique na setinha** ao lado de "wpf-desktop" para colapsar
2. **Ou navegue para o nível superior** (ícone de pasta pai)
3. Você verá TODAS as pastas: app/, components/, lib/, wpf-desktop/, etc.

## ✅ Confirmação

**NADA FOI PERDIDO!** Os dois projetos estão no mesmo repositório:

- ✅ Projeto Web (Next.js) = 450+ arquivos na raiz
- ✅ Projeto Desktop (WPF) = 30+ arquivos em wpf-desktop/

Total: **632 arquivos** no repositório completo!

## 🚀 Como Executar Cada Projeto

### Web (Next.js)
```bash
# Na pasta raiz
npm install
npm run dev
# Acesse http://localhost:3000
```

### Desktop (WPF)
```bash
# Na pasta wpf-desktop
cd wpf-desktop
dotnet restore
dotnet run --project src/CNPJAnalyzer.Desktop
```

## 📊 Banco de Dados

**Ambos os projetos compartilham o MESMO banco Supabase:**
- Web: Usa variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
- Desktop: Usa as mesmas credenciais em appsettings.json
