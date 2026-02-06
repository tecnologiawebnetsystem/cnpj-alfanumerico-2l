"use client"

import { SolutionPageLayout } from "@/components/solucoes/solution-page-layout"
import {
  FileText,
  Code2,
  Search,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Database,
  GitBranch,
  RefreshCw,
  Settings,
} from "lucide-react"

export function NfeReformAdapterContent() {
  return (
    <SolutionPageLayout
      badge="Obrigatorio a partir de Janeiro/2026"
      badgeIcon={AlertTriangle}
      title="NF-e Reform"
      titleHighlight="Adapter"
      subtitle="Powered by AI"
      description="Escaneia automaticamente seus sistemas de emissao de documentos fiscais eletronicos (NF-e, NFC-e, CT-e, NFS-e) e identifica todos os pontos de codigo que precisam incluir os novos campos de CBS e IBS nos layouts XML. Gera o codigo corrigido automaticamente com IA."
      accentColor="#0052CC"
      accentColorLight="rgba(0, 82, 204, 0.08)"
      heroFeatures={[
        {
          icon: Search,
          text: "Varredura automatica de schemas XML",
          detail: "Identifica todos os layouts de NF-e, NFC-e, CT-e, NFCom, NF3e e BP-e",
        },
        {
          icon: Code2,
          text: "Geracao automatica de codigo corrigido",
          detail: "IA gera as alteracoes necessarias para incluir campos CBS/IBS",
        },
        {
          icon: Shield,
          text: "Validacao contra Nota Tecnica 2025.002",
          detail: "Garante conformidade com as regras de validacao do SEFAZ",
        },
      ]}
      heroStats={[
        { icon: FileText, label: "Multi-Documento" },
        { icon: Zap, label: "IA Integrada" },
        { icon: Shield, label: "SEFAZ Ready" },
      ]}
      problemTitle="Por que sua empresa precisa adaptar as notas fiscais agora?"
      problemDescription="A partir de janeiro de 2026, todos os documentos fiscais eletronicos devem incluir campos para CBS (Contribuicao sobre Bens e Servicos) e IBS (Imposto sobre Bens e Servicos). A Receita Federal publicou a Nota Tecnica 2025.002 com novos campos obrigatorios e regras de validacao. Notas fiscais rejeitadas pelo SEFAZ interrompem toda a operacao da empresa."
      problemPoints={[
        "Novos campos obrigatorios no XML da NF-e: grupo CBS, grupo IBS, aliquotas de referencia e codigos de classificacao",
        "Regras de validacao atualizadas no SEFAZ que rejeitam notas sem os novos campos a partir de 01/2026",
        "NFCom (Nota Fiscal de Comunicacao), NF3e (Energia Eletrica) e BP-e (Passagens) tambem serao impactados",
        "Necessidade de manter compatibilidade dual: impostos antigos (PIS/COFINS/ICMS) e novos (CBS/IBS) durante transicao",
        "Risco de parada operacional: no modelo de clearance brasileiro, nota rejeitada PARA o faturamento",
        "Milhares de linhas de codigo em sistemas de emissao precisam ser revisadas e adaptadas",
      ]}
      features={[
        {
          icon: Search,
          title: "Scanner de Schemas XML",
          description: "Identifica automaticamente todos os layouts de documentos fiscais no seu codigo e mapeia os campos que precisam de alteracao para CBS/IBS.",
        },
        {
          icon: Code2,
          title: "Geracao de Codigo com IA",
          description: "Gera automaticamente o codigo para incluir os novos grupos XML de CBS e IBS, com aliquotas, base de calculo e codigos de classificacao.",
        },
        {
          icon: FileCode,
          title: "Validador Pre-SEFAZ",
          description: "Simula a validacao do SEFAZ localmente antes do envio, identificando campos faltantes e erros de schema nos XMLs gerados.",
        },
        {
          icon: RefreshCw,
          title: "Modo Transicao Dual",
          description: "Suporta a emissao com impostos antigos e novos simultaneamente, conforme exigido no periodo de transicao 2026-2033.",
        },
        {
          icon: GitBranch,
          title: "Integracao com Repositorios",
          description: "Conecta com GitHub, GitLab e Azure DevOps para escanear e gerar Pull Requests automaticos com as correcoes necessarias.",
        },
        {
          icon: Database,
          title: "Suporte Multi-Documento",
          description: "NF-e, NFC-e, CT-e, NFS-e, NFCom, NF3e e BP-e. Todos os tipos de documento fiscal eletronico cobertos.",
        },
        {
          icon: Settings,
          title: "Configuracao de Aliquotas",
          description: "Painel para configurar aliquotas de CBS (federal) e IBS (estadual/municipal) conforme as tabelas progressivas de cada ano.",
        },
        {
          icon: FileText,
          title: "Relatorios de Impacto",
          description: "Relatorios detalhados em PDF e CSV mostrando cada alteracao necessaria, estimativa de esforco e prioridade de implementacao.",
        },
        {
          icon: Shield,
          title: "Conformidade Garantida",
          description: "Validacao continua contra as Notas Tecnicas da Receita Federal, com atualizacoes automaticas quando novas regras sao publicadas.",
        },
      ]}
      howItWorksTitle="Como funciona o NF-e Reform Adapter"
      howItWorksSteps={[
        {
          phase: "Fase 1 - Descoberta",
          title: "Escaneamento do codigo-fonte",
          description: "A IA varre seu repositorio identificando todos os pontos que geram, manipulam ou validam XMLs de documentos fiscais. Mapeia schemas, templates, classes de emissao e bibliotecas utilizadas.",
        },
        {
          phase: "Fase 2 - Analise",
          title: "Mapeamento de gaps CBS/IBS",
          description: "Compara os schemas encontrados com as novas exigencias da NT 2025.002. Identifica campos faltantes, validacoes ausentes e logica de calculo que precisa ser atualizada.",
        },
        {
          phase: "Fase 3 - Geracao",
          title: "Codigo corrigido pela IA",
          description: "Gera automaticamente o codigo com os novos grupos XML, campos de aliquota, base de calculo e codigos de classificacao. Mantem compatibilidade com o formato atual.",
        },
        {
          phase: "Fase 4 - Validacao",
          title: "Teste contra regras SEFAZ",
          description: "Executa a validacao completa dos XMLs gerados contra as regras de aceitacao do SEFAZ, identificando qualquer erro antes do envio real.",
        },
        {
          phase: "Fase 5 - Deploy",
          title: "Pull Request automatico",
          description: "Gera um Pull Request no seu repositorio com todas as alteracoes organizadas, documentadas e prontas para revisao da equipe.",
        },
      ]}
      benefits={[
        { value: "95%", label: "Reducao no tempo de adaptacao dos layouts XML" },
        { value: "0", label: "Notas rejeitadas pelo SEFAZ por campos ausentes" },
        { value: "7+", label: "Tipos de documentos fiscais cobertos" },
        { value: "24h", label: "Atualizacao automatica quando novas NT sao publicadas" },
      ]}
      techStack={[
        {
          category: "Documentos Fiscais",
          items: ["NF-e / NFC-e (Nota Tecnica 2025.002)", "CT-e (Conhecimento de Transporte)", "NFS-e (Nota Fiscal de Servico)", "NFCom / NF3e / BP-e"],
        },
        {
          category: "Linguagens e Frameworks",
          items: ["Java (Spring Boot)", "C# (.NET)", "Python", "Node.js / TypeScript", "PHP (Laravel)", "COBOL / RPG (Legados)"],
        },
        {
          category: "Integracoes",
          items: ["GitHub / GitLab / Azure DevOps", "SEFAZ (Ambiente de Homologacao)", "ERP (SAP, Oracle, TOTVS)", "Sistemas de emissao proprios"],
        },
      ]}
      ctaTitle="Prepare seus documentos fiscais para a reforma"
      ctaDescription="Nao espere a rejeicao da primeira nota. O NF-e Reform Adapter da ACT Digital escaneia seu codigo, identifica todas as alteracoes e gera o codigo corrigido automaticamente."
    />
  )
}
