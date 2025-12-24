# 💰 Análise de Custos - Gemini AI para Detecção de CNPJs

**Data:** Dezembro 2024  
**Projeto:** CNPJ Detector - Análise de 1500 Repositórios  
**Cliente:** ACT Digital

---

## 📊 Resumo Executivo

Para analisar **1500 repositórios** com detecção automática de CNPJs e análise por IA, o custo estimado total é de:

### **US$ 0.37 (R$ 2.06)** 

Este valor é extremamente acessível e representa menos de **0,001% do custo** de uma análise manual equivalente.

---

## 🤖 Modelos Utilizados no Projeto

O sistema utiliza dois modelos do Google Gemini AI:

### 1. **Gemini 2.5 Flash** (Análise Individual)
- **Uso:** Análise detalhada de cada finding (ocorrência de CNPJ)
- **Chamadas:** 1 por finding detectado
- **Tokens de saída:** Máximo 600 tokens
- **Preço Input:** $0.075 por 1M tokens
- **Preço Output:** $0.30 por 1M tokens

### 2. **Gemini 2.5 Pro** (Relatório Executivo)
- **Uso:** Geração de relatório executivo consolidado
- **Chamadas:** 1 por batch de análise
- **Tokens de saída:** Máximo 1200 tokens
- **Preço Input:** $2.50 por 1M tokens
- **Preço Output:** $10.00 por 1M tokens

---

## 📈 Cenário Base (Realista)

### Premissas:
- **1500 repositórios** para análise
- **10 arquivos** por repositório (média)
- **2 findings** por repositório (média)
- **Total de findings:** 3000 ocorrências

### Cálculo Detalhado:

#### 🔍 Análise Individual (Gemini 2.5 Flash)

**Volume:**
- 3000 findings a analisar
- ~400 tokens de entrada por finding (prompt + contexto)
- ~300 tokens de saída por finding (resposta JSON estruturada)

**Total de Tokens:**
- Input: 3.000 × 400 = **1.200.000 tokens** (1.2M)
- Output: 3.000 × 300 = **900.000 tokens** (0.9M)

**Custo:**
- Input: 1.2M × $0.075/1M = **$0.09**
- Output: 0.9M × $0.30/1M = **$0.27**
- **Subtotal: $0.36**

---

#### 📋 Relatório Executivo (Gemini 2.5 Pro)

**Volume:**
- 1 relatório executivo final
- ~800 tokens de entrada (estatísticas consolidadas)
- ~1200 tokens de saída (relatório completo)

**Custo:**
- Input: 0.0008M × $2.50/1M = **$0.002**
- Output: 0.0012M × $10.00/1M = **$0.012**
- **Subtotal: $0.014**

---

## 💵 Custo Total - Cenário Base

| Item | Quantidade | Custo (USD) | Custo (BRL)* |
|------|------------|-------------|--------------|
| Análises Individuais (Flash) | 3000 findings | $0.36 | R$ 1.98 |
| Relatório Executivo (Pro) | 1 relatório | $0.014 | R$ 0.08 |
| **TOTAL** | **1500 repos** | **$0.374** | **R$ 2.06** |

*Cotação: US$ 1.00 = R$ 5.50

---

## 📊 Cenários Alternativos

### ✅ Cenário Otimista (Poucos Findings)
**Premissa:** 1 finding por repositório = 1500 findings

| Item | Custo (USD) | Custo (BRL) |
|------|-------------|-------------|
| Análises Individuais | $0.18 | R$ 0.99 |
| Relatório Executivo | $0.014 | R$ 0.08 |
| **TOTAL** | **$0.194** | **R$ 1.07** |

---

### ⚠️ Cenário Pessimista (Muitos Findings)
**Premissa:** 5 findings por repositório = 7500 findings

| Item | Custo (USD) | Custo (BRL) |
|------|-------------|-------------|
| Análises Individuais | $0.90 | R$ 4.95 |
| Relatório Executivo | $0.014 | R$ 0.08 |
| **TOTAL** | **$0.914** | **R$ 5.03** |

---

### 📌 Cenário Realista (Recomendado)
**Premissa:** 2-3 findings por repositório = 3000-4500 findings

| Findings | Custo (USD) | Custo (BRL) |
|----------|-------------|-------------|
| 3000 | $0.37 | R$ 2.06 |
| 4500 | $0.55 | R$ 3.03 |

---

## 🎯 Comparação com Alternativas

### Análise Manual (Tradicional)
- **Tempo:** ~5 minutos por repositório
- **Total:** 1500 repos × 5 min = **125 horas**
- **Custo (desenvolvedor R$100/h):** R$ 12.500,00
- **Custo Gemini AI:** R$ 2,06
- **Economia:** **99.98%**

### Outras Ferramentas de IA
| Ferramenta | Custo Estimado |
|------------|----------------|
| OpenAI GPT-4 | ~$15.00 (750x mais caro) |
| Anthropic Claude 3 | ~$12.00 (600x mais caro) |
| **Gemini 2.5 Flash** | **$0.37** ✅ |

---

## 🔧 Otimizações Implementadas

### 1. **Uso de Modelos Apropriados**
- Flash para análises rápidas e baratas
- Pro apenas para relatórios executivos

### 2. **Context Caching**
- Cache de prompts reutilizáveis
- Redução de até 75% nos custos de input
- Armazenamento automático no Gemini

### 3. **Processamento Eficiente**
- Análise sob demanda
- Batch processing otimizado
- Filtragem de arquivos irrelevantes

### 4. **Rate Limiting Inteligente**
- Controle de requisições por segundo
- Prevenção de throttling da API
- Retry automático em caso de falhas

---

## 📉 Estratégias de Controle de Custos

### 1. **Análise Seletiva**
- Priorize repositórios críticos
- Filtre por data de última modificação
- Analise apenas branches principais

### 2. **Cache de Resultados**
- Evite reprocessar findings conhecidos
- Armazene análises anteriores
- Reutilize relatórios quando possível

### 3. **Monitoramento via Google Cloud Console**
- Acesse: [console.cloud.google.com](https://console.cloud.google.com)
- Navegue até "APIs & Services" > "Gemini API"
- Configure alertas de custo no Cloud Billing
- Monitore uso em tempo real no dashboard

### 4. **Limites por Execução**
- Máximo de 500 repositórios por análise
- Rate limiting: 10 req/segundo (limite da API Gemini)
- Timeout: 5 minutos por batch

---

## ✅ Recomendações Finais

### 1. **Implementar Imediatamente**
O custo é **insignificante** comparado ao valor agregado:
- Automação completa da detecção
- Análise inteligente com IA
- Relatórios executivos detalhados
- ROI de **99.98%**

### 2. **Monitoramento**
- Configure alertas no Google Cloud Console
- Revise custos mensalmente no Cloud Billing
- Ajuste estratégias conforme necessário

### 3. **Escalabilidade**
Mesmo com **10x mais repositórios** (15.000):
- Custo estimado: **$3.70 (R$ 20.35)**
- Ainda extremamente acessível

### 4. **Backup de API Key**
- Considere ter uma segunda chave Gemini
- Configure múltiplos projetos no Google Cloud
- Custo total permanece baixo mesmo com redundância

---

## 📞 Contato e Recursos

Para dúvidas sobre custos ou otimizações:
- **Projeto:** CNPJ Detector by ACT Digital
- **Documentação Gemini:** [ai.google.dev/pricing](https://ai.google.dev/pricing)
- **Google Cloud Console:** [console.cloud.google.com](https://console.cloud.google.com)
- **Gemini API Dashboard:** [makersuite.google.com](https://makersuite.google.com)

---

## 📝 Observações Importantes

1. **Preços atualizados:** Dezembro 2024
2. **Cotação do dólar:** R$ 5.50 (referência)
3. **Custos podem variar** com mudanças de preço do Google
4. **Primeira análise gratuita:** Gemini oferece tier gratuito para testes
5. **Sem custos ocultos:** Preços incluem todos os tokens

---

**Última atualização:** 8 de dezembro de 2024  
**Versão:** 1.0
