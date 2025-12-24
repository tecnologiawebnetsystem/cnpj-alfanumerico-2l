# Guia Completo: Análise Local vs Cloud

## Para Leigos - Escolhendo o Melhor Método

### Análise via CLOUD (Remota)

**O que é?**
O sistema acessa seus repositórios pela internet e analisa os arquivos remotamente, sem baixar nada na sua máquina.

**Quando usar:**
- Primeira vez usando o sistema
- Não quer instalar nada
- Analisando poucos repositórios (menos de 10)
- Internet rápida e estável

**Vantagens:**
- Funciona imediatamente
- Não precisa instalar nada
- Funciona de qualquer computador

**Desvantagens:**
- Mais lento (depende da internet)
- Limitado por APIs do Azure DevOps
- Pode ter timeout em projetos grandes

**Como usar:**
1. Na tela de análise, escolha "Análise via Cloud"
2. Selecione os repositórios
3. Clique em "Analisar"
4. Aguarde (pode demorar 5-30 minutos dependendo do tamanho)

---

### Análise LOCAL (Recomendado)

**O que é?**
O sistema clona os repositórios temporariamente na sua máquina e analisa localmente. É até 10x mais rápido!

**Quando usar:**
- Analisando muitos repositórios (10+)
- Precisa de velocidade
- Tem espaço em disco temporário (alguns GB)
- Quer o melhor desempenho

**Vantagens:**
- Até 10x mais rápido que Cloud
- Processa múltiplos arquivos simultâneos
- Sem limites de API
- Mais confiável

**Desvantagens:**
- Precisa de espaço em disco temporário
- Requer Git instalado

**Como usar:**
1. Na tela de análise, escolha "Análise Local" (badge verde "Recomendado")
2. Selecione os repositórios
3. Clique em "Analisar"
4. O sistema automaticamente:
   - Clona o repositório em `/tmp/analysis-xxx`
   - Analisa todos os arquivos
   - Gera os relatórios
   - Deleta o clone automaticamente
5. Aguarde (muito mais rápido - geralmente 2-10 minutos)

---

## Comparação Técnica

| Característica | Cloud | Local |
|---|---|---|
| Velocidade | Normal | 10x Mais Rápida |
| Instalação | Não precisa | Não precisa |
| Espaço em Disco | 0 MB | Temporário (deletado após) |
| Internet | Necessária (rápida) | Necessária (inicial) |
| Limite de Repos | 50-100 | Ilimitado |
| Progresso em Tempo Real | Sim | Sim |
| Relatórios | Sim | Sim |

---

## Perguntas Frequentes

**P: Análise local é segura?**
R: Sim! O clone é temporário em `/tmp` e é deletado automaticamente após a análise. Nenhum código fica na máquina.

**P: Preciso instalar algo para análise local?**
R: Não! O sistema já vem com tudo necessário (Git, Node.js, etc).

**P: Quanto espaço preciso?**
R: Depende do tamanho dos repositórios. Geralmente 500MB-2GB temporários. Tudo é deletado após a análise.

**P: O que acontece se der erro no meio?**
R: O sistema deleta o clone automaticamente e registra o erro. Você pode tentar novamente.

**P: Posso usar os dois métodos?**
R: Sim! Escolha o método a cada análise conforme sua necessidade.

---

## Recomendação Final

**Use CLOUD se:**
- Primeira vez
- Poucos repositórios
- Sem pressa

**Use LOCAL se:**
- Muitos repositórios
- Precisa de velocidade
- Quer o melhor desempenho
