"use client"

import { SolutionPageLayout } from "@/components/solucoes/solution-page-layout"
import {
  CreditCard,
  Search,
  Shield,
  Zap,
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  Banknote,
  GitBranch,
  FileText,
  Lock,
  Settings,
  Wallet,
} from "lucide-react"

export function SplitPaymentInspectorContent() {
  return (
    <SolutionPageLayout
      badge="Split Payment Obrigatorio"
      badgeIcon={AlertTriangle}
      title="Split Payment"
      titleHighlight="Inspector"
      subtitle="Powered by AI"
      description="Escaneia o codigo dos seus sistemas de pagamento (Contas a Pagar/Receber, gateways, integracao bancaria) e identifica todos os pontos que precisam ser adaptados para o mecanismo de split payment obrigatorio, onde a parcela do imposto e automaticamente direcionada ao governo no momento do pagamento."
      accentColor="#27AE60"
      accentColorLight="rgba(39, 174, 96, 0.08)"
      heroFeatures={[
        {
          icon: CreditCard,
          text: "Analise de fluxos de pagamento",
          detail: "Mapeia todos os pontos de cobranca e recebimento no codigo",
        },
        {
          icon: ArrowRightLeft,
          text: "Logica de split automatico",
          detail: "Gera a separacao automatica de imposto no momento do pagamento",
        },
        {
          icon: Building2,
          text: "Integracao com instituicoes financeiras",
          detail: "Suporte a APIs bancarias e meios de pagamento homologados",
        },
      ]}
      heroStats={[
        { icon: CreditCard, label: "Split Auto" },
        { icon: Lock, label: "Seguro" },
        { icon: Shield, label: "Compliance" },
      ]}
      problemTitle="O split payment muda a forma como o Brasil cobra impostos"
      problemDescription="No novo modelo da reforma tributaria, a parcela de CBS/IBS sera retida automaticamente no momento do pagamento e enviada diretamente ao governo. Isso significa que cada transacao financeira precisa calcular, segregar e rotear o imposto antes de creditar o valor liquido ao fornecedor. Todos os sistemas de pagamento do Brasil precisam ser adaptados."
      problemPoints={[
        "O imposto e retido automaticamente pelo meio de pagamento (cartao, PIX, boleto, TED) no ato da transacao",
        "Sistemas de Contas a Pagar precisam calcular o valor liquido (sem imposto) e o valor tributario separadamente",
        "Contas a Receber deve esperar o credito liquido, ja que o imposto vai direto para o governo",
        "Gateways de pagamento (Cielo, Stone, PagSeguro) vao implementar APIs de split - seu sistema precisa integrar",
        "Conciliacao financeira muda completamente: o valor recebido sera menor que o valor da nota",
        "ERPs e sistemas financeiros precisam de novos campos e fluxos para rastrear a parcela tributaria",
      ]}
      features={[
        {
          icon: Search,
          title: "Scanner de Fluxos Financeiros",
          description: "Identifica todos os pontos no codigo que processam pagamentos, cobranças, transferencias e conciliacoes financeiras.",
        },
        {
          icon: ArrowRightLeft,
          title: "Logica de Split Automatico",
          description: "Gera a logica para calcular e segregar automaticamente a parcela de CBS/IBS em cada transacao financeira.",
        },
        {
          icon: CreditCard,
          title: "Adaptador de Gateway",
          description: "Gera o codigo de integracao com as novas APIs de split payment dos principais meios de pagamento (PIX, cartao, boleto).",
        },
        {
          icon: Wallet,
          title: "Contas a Pagar Adaptado",
          description: "Modifica o fluxo de AP para calcular valor liquido + imposto, gerando duas ordens de pagamento por transacao.",
        },
        {
          icon: Banknote,
          title: "Contas a Receber Adaptado",
          description: "Ajusta o fluxo de AR para reconciliar recebimentos liquidos, ja que o imposto nao chega na conta da empresa.",
        },
        {
          icon: Settings,
          title: "Conciliacao Automatica",
          description: "Gera logica de conciliacao que considera a diferenca entre valor faturado e valor recebido (imposto retido na fonte).",
        },
        {
          icon: Building2,
          title: "Integracao Bancaria",
          description: "Suporte a APIs do Banco Central, bancos comerciais e fintechs para o novo fluxo de split payment via PIX e TED.",
        },
        {
          icon: FileText,
          title: "Relatorio de Impacto Financeiro",
          description: "Analise detalhada do impacto no fluxo de caixa: quanto sera retido, quando sera creditado, e como reconciliar.",
        },
        {
          icon: Lock,
          title: "Auditoria e Rastreabilidade",
          description: "Trilha de auditoria completa para cada transacao, mostrando valor bruto, imposto retido, valor liquido e destino do tributo.",
        },
      ]}
      howItWorksTitle="Como funciona o Split Payment Inspector"
      howItWorksSteps={[
        {
          phase: "Fase 1 - Mapeamento",
          title: "Identificacao de todos os fluxos de pagamento",
          description: "A IA escaneia seu codigo e identifica todos os processos de AP (Contas a Pagar), AR (Contas a Receber), integracoes com gateways e fluxos bancarios.",
        },
        {
          phase: "Fase 2 - Analise de Impacto",
          title: "Gap analysis do fluxo financeiro",
          description: "Analisa cada fluxo e identifica onde o split payment precisa ser implementado: calculo do imposto, segregacao do valor, e roteamento para o governo.",
        },
        {
          phase: "Fase 3 - Geracao",
          title: "Codigo de split e conciliacao",
          description: "Gera o codigo para calcular CBS/IBS em cada transacao, segregar o valor tributario, e conciliar os recebimentos liquidos.",
        },
        {
          phase: "Fase 4 - Integracao",
          title: "Adaptadores para meios de pagamento",
          description: "Gera os adaptadores de integracao com as APIs dos principais gateways e bancos que implementarao o split payment.",
        },
        {
          phase: "Fase 5 - Validacao",
          title: "Simulacao de transacoes com split",
          description: "Simula transacoes reais com o split payment ativo, validando calculos, conciliacoes e fluxo de caixa projetado.",
        },
      ]}
      benefits={[
        { value: "100%", label: "Conformidade com o novo mecanismo de split payment" },
        { value: "Zero", label: "Surpresas na conciliacao financeira apos a reforma" },
        { value: "3x", label: "Mais rapido que mapear fluxos financeiros manualmente" },
        { value: "Real-time", label: "Calculo e segregacao de imposto em tempo real" },
      ]}
      techStack={[
        {
          category: "Meios de Pagamento",
          items: ["PIX (Banco Central)", "Cartao de Credito/Debito", "Boleto Bancario", "TED / DOC", "Gateways (Cielo, Stone, PagSeguro)"],
        },
        {
          category: "Sistemas Financeiros",
          items: ["SAP FI (Financial Accounting)", "Oracle Financials", "TOTVS Financeiro", "Microsoft Dynamics Finance", "Sistemas AP/AR proprios"],
        },
        {
          category: "Integracoes",
          items: ["APIs bancarias (Open Banking)", "CNAB 240/400 (adaptado)", "ISO 20022", "Webhooks de gateway", "Conciliadoras automaticas"],
        },
      ]}
      ctaTitle="Seu fluxo de caixa vai mudar. Prepare-se."
      ctaDescription="O split payment muda fundamentalmente como sua empresa recebe e paga. O Split Payment Inspector da ACT Digital mapeia todos os impactos e gera o codigo de adaptacao."
    />
  )
}
