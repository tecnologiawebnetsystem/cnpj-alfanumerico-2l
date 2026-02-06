"use client"

import { SolutionPageLayout } from "@/components/solucoes/solution-page-layout"
import {
  Calculator,
  ArrowRightLeft,
  Search,
  Shield,
  Zap,
  FileText,
  AlertTriangle,
  Settings,
  Database,
  GitBranch,
  Clock,
  BarChart3,
  Layers,
  RefreshCw,
} from "lucide-react"

export function TaxRuleMigratorContent() {
  return (
    <SolutionPageLayout
      badge="Transicao progressiva 2026-2033"
      badgeIcon={Clock}
      title="Tax Rule"
      titleHighlight="Migrator"
      subtitle="Powered by AI"
      description="Analisa toda a logica de calculo tributario nos seus sistemas (ERP, e-commerce, faturamento) e mapeia automaticamente as regras de PIS/COFINS/ICMS/ISS para as novas regras de CBS/IBS/IS. Gera um relatorio de gap analysis completo e as alteracoes de codigo para cada ano da transicao."
      accentColor="#E67E22"
      accentColorLight="rgba(230, 126, 34, 0.08)"
      heroFeatures={[
        {
          icon: ArrowRightLeft,
          text: "Mapeamento automatico de regras tributarias",
          detail: "De PIS/COFINS/ICMS/ISS para CBS/IBS/IS com IA",
        },
        {
          icon: Calculator,
          text: "Simulacao de calculo dual",
          detail: "Calcula impostos antigos e novos simultaneamente por ano",
        },
        {
          icon: BarChart3,
          text: "Gap analysis detalhado",
          detail: "Relatorio completo de todas as diferencas e acoes necessarias",
        },
      ]}
      heroStats={[
        { icon: ArrowRightLeft, label: "Migracao IA" },
        { icon: Clock, label: "7 anos cobertos" },
        { icon: Shield, label: "Compliance" },
      ]}
      problemTitle="O desafio da transicao tributaria de 7 anos"
      problemDescription="A reforma tributaria brasileira implementa uma transicao progressiva de 2026 a 2033. Durante esse periodo, as empresas precisam calcular e reportar SIMULTANEAMENTE os impostos antigos (PIS, COFINS, ICMS, ISS) e os novos (CBS, IBS). As aliquotas mudam a cada ano, criando uma complexidade enorme para os sistemas."
      problemPoints={[
        "Em 2026-2027: CBS a 0,9% e IBS a 0,1% coexistem com PIS/COFINS/ICMS/ISS integrais",
        "A partir de 2027: reducao progressiva de PIS/COFINS enquanto CBS assume gradualmente",
        "2029-2032: ICMS/ISS sao reduzidos em 10% ao ano enquanto IBS aumenta proporcionalmente",
        "2033: extincao total de PIS/COFINS/ICMS/ISS - somente CBS/IBS vigentes",
        "Cada estado e municipio pode ter ajustes especificos nas aliquotas de IBS",
        "Regimes especiais (Simples Nacional, Zona Franca de Manaus) tem regras proprias de transicao",
      ]}
      features={[
        {
          icon: Search,
          title: "Scanner de Regras Tributarias",
          description: "Identifica toda a logica de calculo de impostos no codigo: formulas, tabelas de aliquotas, regras condicionais, isencoes e regimes especiais.",
        },
        {
          icon: ArrowRightLeft,
          title: "Mapeamento Automatico",
          description: "Mapeia cada regra de PIS/COFINS/ICMS/ISS para a regra correspondente de CBS/IBS, considerando as diferencas de base de calculo e aliquotas.",
        },
        {
          icon: Calculator,
          title: "Motor de Calculo Dual",
          description: "Gera a logica para calcular impostos antigos e novos em paralelo, com as aliquotas corretas para cada ano do periodo de transicao.",
        },
        {
          icon: Layers,
          title: "Tabela de Aliquotas Progressivas",
          description: "Mantem tabela atualizada de aliquotas CBS/IBS para cada ano (2026-2033), com reducao proporcional dos impostos antigos.",
        },
        {
          icon: Settings,
          title: "Configuracao por UF/Municipio",
          description: "Suporte a aliquotas diferenciadas por estado e municipio, incluindo regras especificas de cada jurisdicao para o IBS.",
        },
        {
          icon: RefreshCw,
          title: "Regimes Especiais",
          description: "Tratamento especifico para Simples Nacional, Zona Franca de Manaus, MEI, e outros regimes diferenciados previstos na reforma.",
        },
        {
          icon: BarChart3,
          title: "Gap Analysis Detalhado",
          description: "Relatorio completo mostrando cada regra atual, a regra equivalente no novo modelo, e o que precisa ser alterado.",
        },
        {
          icon: FileText,
          title: "Relatorios por Ano",
          description: "Gera relatorios especificos para cada ano da transicao, mostrando aliquotas vigentes e configuracoes necessarias.",
        },
        {
          icon: GitBranch,
          title: "Codigo Pronto para Cada Fase",
          description: "Gera o codigo de calculo tributario para cada fase da transicao, com feature flags para ativar conforme o ano vigente.",
        },
      ]}
      howItWorksTitle="Como funciona o Tax Rule Migrator"
      howItWorksSteps={[
        {
          phase: "Fase 1 - Inventario",
          title: "Mapeamento de todas as regras tributarias",
          description: "A IA escaneia seu codigo e identifica todas as funcoes, classes, stored procedures e configuracoes relacionadas a calculo de impostos. Cria um inventario completo.",
        },
        {
          phase: "Fase 2 - Analise Comparativa",
          title: "Gap analysis antigo vs. novo modelo",
          description: "Compara cada regra encontrada com o novo modelo tributario. Identifica o que muda, o que permanece, e o que precisa ser criado do zero para CBS/IBS.",
        },
        {
          phase: "Fase 3 - Simulacao",
          title: "Teste de calculo dual",
          description: "Simula calculos com cenarios reais da sua empresa, comparando o resultado dos impostos antigos com os novos para cada ano da transicao.",
        },
        {
          phase: "Fase 4 - Geracao de Codigo",
          title: "Logica de transicao progressiva",
          description: "Gera o codigo com suporte a calculo dual, tabelas de aliquotas por ano, e feature flags para alternar entre as fases automaticamente.",
        },
        {
          phase: "Fase 5 - Roadmap",
          title: "Plano de implementacao por ano",
          description: "Entrega um roadmap detalhado de implementacao com marcos para cada ano da transicao (2026-2033), prioridades e dependencias.",
        },
      ]}
      benefits={[
        { value: "80%", label: "Reducao no esforco de mapeamento de regras tributarias" },
        { value: "7", label: "Anos de transicao cobertos com aliquotas pre-configuradas" },
        { value: "100%", label: "Cobertura de PIS, COFINS, ICMS, ISS para CBS/IBS" },
        { value: "5k+", label: "Cenarios de calculo tributario validados por simulacao" },
      ]}
      techStack={[
        {
          category: "Impostos Mapeados",
          items: ["PIS / COFINS -> CBS (Federal)", "ICMS / ISS -> IBS (Estadual/Municipal)", "IPI -> IS (Imposto Seletivo)", "Simples Nacional / MEI", "Zona Franca de Manaus"],
        },
        {
          category: "ERPs Suportados",
          items: ["SAP (S/4HANA, ECC)", "Oracle (EBS, Cloud)", "TOTVS (Protheus, Datasul)", "Microsoft Dynamics", "Sistemas proprios"],
        },
        {
          category: "Saidas",
          items: ["Codigo-fonte com logica dual", "Tabelas de aliquotas por ano", "Relatorio de gap analysis (PDF/CSV)", "Roadmap de implementacao", "Feature flags por fase"],
        },
      ]}
      ctaTitle="Nao espere 2027 para entender o impacto"
      ctaDescription="O Tax Rule Migrator mapeia toda a sua logica tributaria e gera o codigo para cada fase da transicao. Comece agora e tenha 7 anos de tranquilidade."
    />
  )
}
