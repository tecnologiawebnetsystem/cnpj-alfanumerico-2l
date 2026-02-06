"use client"

import { SolutionPageLayout } from "@/components/solucoes/solution-page-layout"
import {
  FileStack,
  Search,
  Shield,
  Zap,
  AlertTriangle,
  FileText,
  Building2,
  Heart,
  Landmark,
  Settings,
  Database,
  CheckCircle,
  RefreshCw,
} from "lucide-react"

export function DereBuilderContent() {
  return (
    <SolutionPageLayout
      badge="Regimes Especificos da Reforma"
      badgeIcon={Landmark}
      title="DeRE"
      titleHighlight="Builder"
      subtitle="Powered by AI"
      description="Ferramenta especializada para gerar e validar as novas Declaracoes dos Regimes Especificos (DeRE) exigidas pela reforma tributaria para setores regulados: instituicoes financeiras, operadoras de planos de saude, seguradoras, entidades de previdencia complementar, administradoras de consorcios e empresas de concursos de prognostico."
      accentColor="#16A085"
      accentColorLight="rgba(22, 160, 133, 0.08)"
      heroFeatures={[
        {
          icon: FileStack,
          text: "Geracao automatica de DeRE",
          detail: "Monta a declaracao com base nos dados do sistema da empresa",
        },
        {
          icon: Shield,
          text: "Validacao contra leiautes oficiais",
          detail: "Valida contra os leiautes publicados pela Receita Federal",
        },
        {
          icon: Building2,
          text: "Multi-setor regulado",
          detail: "Financeiro, saude, seguros, previdencia, consorcios",
        },
      ]}
      heroStats={[
        { icon: Landmark, label: "Setores Regulados" },
        { icon: FileStack, label: "DeRE Completa" },
        { icon: Shield, label: "Compliance" },
      ]}
      problemTitle="Setores regulados tem regras proprias na reforma"
      problemDescription="A reforma tributaria criou regimes especificos de tributacao para setores regulados. Esses setores nao vao emitir NF-e ou NFS-e convencionais — ao inves disso, devem entregar uma declaracao propria chamada DeRE (Declaracao dos Regimes Especificos) com leiautes e regras de validacao especificas definidos pela Receita Federal."
      problemPoints={[
        "Instituicoes financeiras (bancos, corretoras, distribuidoras) precisam declarar operacoes de credito, cambio e derivativos",
        "Operadoras de planos de saude devem declarar receitas de mensalidades, co-participacoes e reembolsos",
        "Seguradoras e resseguradoras precisam detalhar premios, sinistros e reservas tecnicas",
        "Entidades de previdencia complementar tem regras proprias para contribuicoes e beneficios",
        "Administradoras de consorcios devem declarar taxas de administracao e fundos de reserva",
        "Os leiautes da DeRE estao sendo construidos pela Receita Federal — antecipar-se e fundamental",
      ]}
      features={[
        {
          icon: Search,
          title: "Extrator de Dados",
          description: "Conecta aos sistemas da empresa (core banking, sinistros, faturamento) e extrai automaticamente os dados necessarios para a DeRE.",
        },
        {
          icon: FileStack,
          title: "Montagem Automatica",
          description: "Monta a declaracao no formato exigido pela Receita Federal, preenchendo campos, calculando totalizadores e aplicando regras de validacao.",
        },
        {
          icon: CheckCircle,
          title: "Validacao Pre-Envio",
          description: "Valida a DeRE contra as regras de aceitacao antes do envio, identificando campos ausentes, calculos incorretos e inconsistencias.",
        },
        {
          icon: Landmark,
          title: "Templates por Setor",
          description: "Templates pre-configurados para cada setor regulado: financeiro, saude, seguros, previdencia, consorcios e prognosticos.",
        },
        {
          icon: Database,
          title: "Mapeamento de Dados",
          description: "Mapeia os campos dos sistemas internos para os campos da DeRE, criando um de-para automatizado e auditavel.",
        },
        {
          icon: RefreshCw,
          title: "Atualizacao de Leiautes",
          description: "Quando a Receita Federal publica novos leiautes ou correcoes, a ferramenta atualiza automaticamente os templates.",
        },
        {
          icon: Settings,
          title: "Configuracao de Regras",
          description: "Painel para configurar regras especificas do setor: base de calculo, isencoes, deducoes e tratamentos diferenciados.",
        },
        {
          icon: Heart,
          title: "Modulo Saude",
          description: "Tratamento especializado para operadoras: mensalidades, co-participacoes, reembolsos SUS, procedimentos e tabela TUSS.",
        },
        {
          icon: FileText,
          title: "Relatorio de Conformidade",
          description: "Relatorio detalhado mostrando o status de cada campo, divergencias encontradas e acoes corretivas necessarias.",
        },
      ]}
      howItWorksTitle="Como funciona o DeRE Builder"
      howItWorksSteps={[
        {
          phase: "Fase 1 - Configuracao",
          title: "Selecao do regime e template",
          description: "Selecione o setor regulado da empresa e o template correspondente. Configure as regras especificas: base de calculo, isencoes e deducoes aplicaveis.",
        },
        {
          phase: "Fase 2 - Extracao",
          title: "Coleta de dados dos sistemas",
          description: "O Builder conecta aos sistemas da empresa (core banking, ERP, sistema de sinistros, faturamento) e extrai os dados necessarios para o periodo declarado.",
        },
        {
          phase: "Fase 3 - Montagem",
          title: "Geracao automatica da DeRE",
          description: "Monta a declaracao no formato oficial, preenchendo campos, calculando totalizadores, e aplicando as regras de validacao do setor.",
        },
        {
          phase: "Fase 4 - Validacao",
          title: "Verificacao pre-envio",
          description: "Executa todas as validacoes contra os leiautes oficiais. Identifica campos faltantes, calculos divergentes e inconsistencias entre blocos.",
        },
        {
          phase: "Fase 5 - Entrega",
          title: "Envio e protocolo",
          description: "Gera o arquivo no formato oficial para envio a Receita Federal. Armazena protocolo de entrega e historico para auditoria.",
        },
      ]}
      benefits={[
        { value: "6+", label: "Setores regulados com templates especializados" },
        { value: "Auto", label: "Extracao automatica de dados dos sistemas internos" },
        { value: "100%", label: "Validacao contra leiautes oficiais da Receita Federal" },
        { value: "Audit", label: "Trilha de auditoria completa de cada declaracao gerada" },
      ]}
      techStack={[
        {
          category: "Setores Regulados",
          items: ["Instituicoes financeiras (bancos, corretoras)", "Operadoras de planos de saude", "Seguradoras e resseguradoras", "Previdencia complementar", "Consorcios", "Concursos de prognostico"],
        },
        {
          category: "Integracoes de Dados",
          items: ["Core banking (Temenos, FIS, Finastra)", "Sistemas de sinistros", "ERPs financeiros", "Data warehouses", "APIs REST / SFTP"],
        },
        {
          category: "Saidas",
          items: ["DeRE no formato oficial (XML)", "Relatorio de validacao (PDF)", "Log de extracao e mapeamento", "Protocolo de entrega", "Dashboard de conformidade"],
        },
      ]}
      ctaTitle="Antecipe-se aos novos leiautes"
      ctaDescription="A Receita Federal esta construindo os leiautes da DeRE. O DeRE Builder da ACT Digital ajuda sua empresa a se preparar antes da obrigatoriedade, mapeando dados e configurando regras."
    />
  )
}
