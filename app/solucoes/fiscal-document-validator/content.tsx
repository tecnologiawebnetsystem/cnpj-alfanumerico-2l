"use client"

import { SolutionPageLayout } from "@/components/solucoes/solution-page-layout"
import {
  FileCheck,
  Search,
  Shield,
  Zap,
  AlertTriangle,
  FileText,
  CheckCircle,
  Clock,
  Code2,
  Database,
  Activity,
  RefreshCw,
  BarChart3,
} from "lucide-react"

export function FiscalDocumentValidatorContent() {
  return (
    <SolutionPageLayout
      badge="Validacao em Tempo Real"
      badgeIcon={FileCheck}
      title="Fiscal Document"
      titleHighlight="Validator"
      subtitle="Powered by AI"
      description="Validador em tempo real de documentos fiscais eletronicos (NF-e, NFC-e, NFS-e, CT-e, NFCom, NF3e, BP-e) contra as novas regras da reforma tributaria. Simula a validacao do SEFAZ e da prefeitura ANTES do envio real, identificando campos faltantes, aliquotas incorretas e erros de schema."
      accentColor="#C0392B"
      accentColorLight="rgba(192, 57, 43, 0.08)"
      heroFeatures={[
        {
          icon: FileCheck,
          text: "Validacao pre-envio completa",
          detail: "Simula SEFAZ e prefeitura localmente antes do envio real",
        },
        {
          icon: Zap,
          text: "Tempo real e alta performance",
          detail: "Validacao em milissegundos, pronto para volume de producao",
        },
        {
          icon: Shield,
          text: "Regras sempre atualizadas",
          detail: "Atualizacao automatica quando Notas Tecnicas sao publicadas",
        },
      ]}
      heroStats={[
        { icon: Zap, label: "Real-time" },
        { icon: FileCheck, label: "Pre-SEFAZ" },
        { icon: Shield, label: "Zero Rejeicao" },
      ]}
      problemTitle="Uma nota rejeitada para toda a operacao"
      problemDescription="No modelo de clearance do Brasil, uma nota fiscal precisa ser aprovada ANTES de acompanhar a mercadoria ou registrar o servico. Se o SEFAZ ou a prefeitura rejeitar, a operacao para. Com os novos campos CBS/IBS, o risco de rejeicao aumenta dramaticamente nos primeiros meses."
      problemPoints={[
        "Nota rejeitada pelo SEFAZ = mercadoria parada no dock, caminhao nao sai, cliente nao recebe",
        "Novos campos CBS/IBS tem regras de validacao complexas: grupo obrigatorio, aliquotas de referencia, codigos de classificacao",
        "Erros de schema XML sao silenciosos: o sistema gera a nota, mas o SEFAZ rejeita na hora do envio",
        "Em periodo de transicao, validacoes antigas e novas coexistem - dobro de pontos de falha",
        "NFS-e municipais tem regras proprias: cada prefeitura pode rejeitar por motivos diferentes",
        "Volume alto de notas (milhares/dia) amplifica o impacto: um erro sistematico para toda a operacao",
      ]}
      features={[
        {
          icon: FileCheck,
          title: "Validacao Pre-SEFAZ",
          description: "Executa todas as regras de validacao do SEFAZ localmente, incluindo novos campos CBS/IBS, antes de enviar a nota.",
        },
        {
          icon: Search,
          title: "Detector de Campos Ausentes",
          description: "Identifica campos obrigatorios faltantes nos XMLs: grupos CBS, grupos IBS, aliquotas de referencia e codigos de classificacao.",
        },
        {
          icon: Activity,
          title: "Validacao em Tempo Real",
          description: "API de validacao com resposta em milissegundos, pronta para ser integrada no fluxo de emissao em producao.",
        },
        {
          icon: Code2,
          title: "Validacao de Schema XSD",
          description: "Verifica a conformidade do XML contra os schemas XSD oficiais atualizados, incluindo os novos grupos da reforma.",
        },
        {
          icon: BarChart3,
          title: "Dashboard de Qualidade",
          description: "Painel em tempo real mostrando taxa de aprovacao, erros mais frequentes, tendencias e alertas proativos.",
        },
        {
          icon: RefreshCw,
          title: "Regras Auto-Atualizaveis",
          description: "Quando a Receita Federal publica uma nova NT ou correcao, as regras de validacao sao atualizadas automaticamente.",
        },
        {
          icon: Database,
          title: "Multi-Documento",
          description: "Suporte a todos os tipos: NF-e, NFC-e, NFS-e, CT-e, CT-e OS, NFCom, NF3e, BP-e, MDF-e, cada um com suas regras.",
        },
        {
          icon: Clock,
          title: "Historico de Validacoes",
          description: "Log completo de todas as validacoes realizadas, com detalhes de cada erro encontrado e correcao aplicada.",
        },
        {
          icon: FileText,
          title: "Relatorio de Erros Sistematicos",
          description: "Identifica padroes de erro recorrentes que indicam problemas no sistema de emissao, nao apenas na nota individual.",
        },
      ]}
      howItWorksTitle="Como funciona o Fiscal Document Validator"
      howItWorksSteps={[
        {
          phase: "Integracao",
          title: "API integrada ao fluxo de emissao",
          description: "O Validator e integrado como uma etapa no fluxo de emissao, entre a geracao do XML e o envio ao SEFAZ/prefeitura. Pode ser via API REST, webhook ou SDK.",
        },
        {
          phase: "Validacao",
          title: "Execucao de regras em milissegundos",
          description: "O XML e validado contra o schema XSD, regras de negocio SEFAZ, campos CBS/IBS obrigatorios, aliquotas de referencia e validacoes matematicas.",
        },
        {
          phase: "Resposta",
          title: "Aprovado ou detalhes do erro",
          description: "Se aprovado, o XML segue para envio. Se reprovado, retorna a lista exata de erros com campo, regra violada e sugestao de correcao.",
        },
        {
          phase: "Monitoramento",
          title: "Dashboard e alertas",
          description: "O dashboard mostra em tempo real a taxa de aprovacao, erros mais comuns e alertas quando um novo tipo de erro surge.",
        },
        {
          phase: "Evolucao",
          title: "Atualizacao automatica de regras",
          description: "Quando novas Notas Tecnicas sao publicadas, as regras de validacao sao atualizadas automaticamente sem necessidade de deploy.",
        },
      ]}
      benefits={[
        { value: "0%", label: "Taxa de rejeicao no SEFAZ com validacao pre-envio" },
        { value: "<50ms", label: "Tempo medio de validacao por documento" },
        { value: "10+", label: "Tipos de documentos fiscais validados" },
        { value: "24/7", label: "Monitoramento continuo com alertas proativos" },
      ]}
      techStack={[
        {
          category: "Documentos Suportados",
          items: ["NF-e / NFC-e (modelo 55/65)", "CT-e / CT-e OS (modelo 57/67)", "NFS-e (multi-municipal)", "NFCom / NF3e / BP-e / MDF-e"],
        },
        {
          category: "Integracoes",
          items: ["API REST (JSON/XML)", "SDK Java / .NET / Node.js", "Webhook de pre-envio", "Plugin para ERPs", "SEFAZ Homologacao"],
        },
        {
          category: "Monitoramento",
          items: ["Dashboard tempo real", "Alertas Slack / Teams / Email", "Metricas Prometheus/Grafana", "Log centralizado", "Relatorios PDF/CSV"],
        },
      ]}
      ctaTitle="Zero rejeicoes. Zero paradas."
      ctaDescription="O Fiscal Document Validator valida cada nota antes do envio ao SEFAZ, garantindo que campos CBS/IBS estejam corretos. Nunca mais perca uma venda por nota rejeitada."
    />
  )
}
