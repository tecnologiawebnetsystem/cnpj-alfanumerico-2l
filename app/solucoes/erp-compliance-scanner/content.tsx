"use client"

import { SolutionPageLayout } from "@/components/solucoes/solution-page-layout"
import {
  Server,
  Search,
  Shield,
  Zap,
  AlertTriangle,
  BarChart3,
  FileText,
  GitBranch,
  CheckCircle,
  Settings,
  Database,
  Layers,
  Clock,
} from "lucide-react"

export function ErpComplianceScannerContent() {
  return (
    <SolutionPageLayout
      badge="Diagnostico Completo de ERP"
      badgeIcon={Server}
      title="ERP Compliance"
      titleHighlight="Scanner"
      subtitle="Powered by AI"
      description="Scanner especializado para os principais ERPs do mercado (SAP, Oracle EBS, TOTVS Protheus/Datasul, Microsoft Dynamics) que faz um diagnostico completo de aderencia a reforma tributaria. Verifica versao, patches, tax engine, mapeamento NCM, cadastro de aliquotas e gera um roadmap de adequacao priorizado."
      accentColor="#2980B9"
      accentColorLight="rgba(41, 128, 185, 0.08)"
      heroFeatures={[
        {
          icon: Server,
          text: "Diagnostico profundo do ERP",
          detail: "Versao, patches, modulos fiscais, tax engine e configuracoes",
        },
        {
          icon: BarChart3,
          text: "Score de aderencia",
          detail: "Nota de 0 a 100 indicando o nivel de preparacao do ERP",
        },
        {
          icon: FileText,
          text: "Roadmap priorizado",
          detail: "Plano de acao com patches, configuracoes e customizacoes necessarias",
        },
      ]}
      heroStats={[
        { icon: Server, label: "Multi-ERP" },
        { icon: BarChart3, label: "Score 0-100" },
        { icon: Shield, label: "Compliance" },
      ]}
      problemTitle="Seu ERP esta pronto para a reforma tributaria?"
      problemDescription="A maioria dos ERPs em operacao no Brasil nao esta preparada para CBS/IBS. Versoes antigas nao receberao patches. Customizacoes podem impedir atualizacoes. Tax engines precisam ser reconfiguradas. Sem um diagnostico preciso, o risco de parada operacional no dia 1 da reforma e real."
      problemPoints={[
        "Oracle EBS abaixo da versao 12.2.6 NAO recebera atualizacoes para CBS/IBS - upgrade obrigatorio",
        "SAP ECC precisa de migration path para S/4HANA para suporte completo a nova tributacao",
        "TOTVS Protheus requer patches especificos e revisao de todos os pontos de entrada customizados",
        "Tax engines (Vertex, Avalara, Mastersaf) precisam de novas tabelas e regras de calculo",
        "Customizacoes ABAP/PL-SQL/ADVPL podem conflitar com os patches oficiais do fabricante",
        "Mapeamento NCM/CEST precisa ser revisado para os novos codigos de classificacao CBS/IBS",
      ]}
      features={[
        {
          icon: Search,
          title: "Scanner de Versao e Patches",
          description: "Verifica a versao exata do ERP, patches aplicados, service packs, e identifica se a versao suporta CBS/IBS ou requer upgrade.",
        },
        {
          icon: Settings,
          title: "Analise de Tax Engine",
          description: "Inspeciona a configuracao da tax engine (Taxall, Mastersaf, Vertex) e identifica tabelas, regras e cenarios que precisam de atualizacao.",
        },
        {
          icon: Database,
          title: "Auditoria de Cadastros",
          description: "Verifica cadastros de NCM, CFOP, CST, aliquotas e regimes fiscais, identificando itens desatualizados ou incompativeis.",
        },
        {
          icon: Layers,
          title: "Mapeamento de Customizacoes",
          description: "Identifica todas as customizacoes (ABAP exits, user exits, BAdIs, pontos de entrada) que podem conflitar com patches CBS/IBS.",
        },
        {
          icon: BarChart3,
          title: "Score de Aderencia",
          description: "Gera um score de 0 a 100 indicando o nivel de preparacao do ERP, com breakdown por area (fiscal, financeiro, suprimentos).",
        },
        {
          icon: CheckCircle,
          title: "Checklist de Conformidade",
          description: "Lista completa de itens que precisam ser verificados e corrigidos, organizados por prioridade e impacto.",
        },
        {
          icon: Clock,
          title: "Roadmap de Adequacao",
          description: "Plano de acao detalhado com timeline, dependencias, esforco estimado e recursos necessarios para cada etapa.",
        },
        {
          icon: GitBranch,
          title: "Analise de Impacto em Integracao",
          description: "Verifica interfaces e integracoes (EDI, APIs, flat files) que serao impactadas pela inclusao de CBS/IBS.",
        },
        {
          icon: FileText,
          title: "Relatorio Executivo",
          description: "Relatorio para CIO/CFO com visao executiva do risco, investimento necessario e cronograma recomendado.",
        },
      ]}
      howItWorksTitle="Como funciona o ERP Compliance Scanner"
      howItWorksSteps={[
        {
          phase: "Fase 1 - Coleta",
          title: "Inventario do ambiente ERP",
          description: "Coleta informacoes sobre versao, patches, modulos ativos, tax engine, customizacoes e integracoes do ERP. Pode ser feito via agente instalado ou questionario guiado.",
        },
        {
          phase: "Fase 2 - Analise",
          title: "Diagnostico de aderencia",
          description: "A IA analisa cada componente contra os requisitos da reforma: versao minima, patches necessarios, configuracoes de tax engine, e cadastros fiscais.",
        },
        {
          phase: "Fase 3 - Customizacoes",
          title: "Auditoria de codigo customizado",
          description: "Escaneia todas as customizacoes (ABAP, PL/SQL, ADVPL, X++) e identifica conflitos potenciais com os patches oficiais do fabricante.",
        },
        {
          phase: "Fase 4 - Score",
          title: "Geracao do score de aderencia",
          description: "Calcula o score de 0 a 100 com breakdown detalhado por area funcional. Identifica os maiores riscos e quick wins.",
        },
        {
          phase: "Fase 5 - Roadmap",
          title: "Plano de acao priorizado",
          description: "Gera roadmap com fases, dependencias, esforco estimado e recursos. Inclui recomendacoes especificas para o ERP e versao em uso.",
        },
      ]}
      benefits={[
        { value: "Score", label: "Nota de aderencia de 0-100 com breakdown por area" },
        { value: "4+", label: "ERPs suportados com diagnostico especializado" },
        { value: "48h", label: "Tempo medio para diagnostico completo do ambiente" },
        { value: "CxO", label: "Relatorio executivo pronto para apresentar a diretoria" },
      ]}
      techStack={[
        {
          category: "ERPs Suportados",
          items: ["SAP ECC / S/4HANA", "Oracle EBS / Cloud", "TOTVS Protheus / Datasul", "Microsoft Dynamics 365", "Infor / JD Edwards"],
        },
        {
          category: "Tax Engines",
          items: ["SAP Tax Classification", "Mastersaf DW", "Vertex O Series", "Avalara", "Thomson Reuters ONESOURCE"],
        },
        {
          category: "Areas Analisadas",
          items: ["Fiscal (NF-e, NFS-e, EFD)", "Financeiro (AP/AR, Banking)", "Suprimentos (Procurement)", "Vendas (Order-to-Cash)", "Integrações (EDI, API, Flat file)"],
        },
      ]}
      ctaTitle="Descubra se seu ERP esta pronto"
      ctaDescription="Nao espere o dia 1 da reforma para descobrir que seu ERP precisa de upgrade. O ERP Compliance Scanner da ACT Digital faz o diagnostico completo em 48 horas."
    />
  )
}
