"use client"

import { SolutionPageLayout } from "@/components/solucoes/solution-page-layout"
import {
  MapPin,
  Search,
  Shield,
  Zap,
  AlertTriangle,
  Building2,
  FileText,
  GitBranch,
  Globe,
  Layers,
  RefreshCw,
  Settings,
  Code2,
} from "lucide-react"

export function NfseHarmonizerContent() {
  return (
    <SolutionPageLayout
      badge="5.570 Municipios Diferentes"
      badgeIcon={MapPin}
      title="NFS-e Municipality"
      titleHighlight="Harmonizer"
      subtitle="Powered by AI"
      description="O Brasil tem mais de 5.500 municipios, cada um com seu proprio sistema de NFS-e, schema XML, regras de validacao e codigos de servico diferentes. O Harmonizer detecta no codigo quais municipios estao integrados, o que precisa mudar para cada um, e suporta a migracao para o modelo nacional de NFS-e."
      accentColor="#8E44AD"
      accentColorLight="rgba(142, 68, 173, 0.08)"
      heroFeatures={[
        {
          icon: MapPin,
          text: "Deteccao automatica de municipios integrados",
          detail: "Identifica no codigo todas as prefeituras com integracao ativa",
        },
        {
          icon: Layers,
          text: "Compatibilizacao multi-municipal",
          detail: "Gera adaptadores para cada schema e webservice municipal",
        },
        {
          icon: Globe,
          text: "Migracao para modelo nacional",
          detail: "Suporte a transicao para a NFS-e nacional quando disponivel",
        },
      ]}
      heroStats={[
        { icon: MapPin, label: "Multi-Municipal" },
        { icon: Layers, label: "Multi-Schema" },
        { icon: Shield, label: "Compliance" },
      ]}
      problemTitle="O caos das NFS-e municipais no Brasil"
      problemDescription="Diferente da NF-e (que e estadual e padronizada), a NFS-e e controlada por cada municipio individualmente. Existem dezenas de provedores de software diferentes (ABRASF, Betha, IPM, Tecnos, etc), cada um com schemas XML, webservices, certificados e regras de validacao proprias. Com a reforma tributaria, cada sistema municipal precisa incluir os novos campos de CBS/IBS."
      problemPoints={[
        "Cada municipio tem seu proprio webservice, schema XML e regras de validacao para NFS-e",
        "Existem mais de 20 provedores diferentes de NFS-e municipal (ABRASF, Betha, IPM, Fly, Tecnos, etc)",
        "Sao Paulo ja confirmou que NAO vai migrar para o modelo nacional em 2026",
        "Grandes empresas mantem integracoes com 50+ municipios diferentes simultaneamente",
        "Cada provedor vai implementar os campos CBS/IBS de forma diferente e em momentos diferentes",
        "Manter e testar integracoes com dezenas de municipios consome recursos enormes de desenvolvimento",
      ]}
      features={[
        {
          icon: Search,
          title: "Scanner de Integracoes Municipais",
          description: "Detecta automaticamente todos os municipios integrados no codigo, identificando o provedor, schema e versao de cada integracao.",
        },
        {
          icon: MapPin,
          title: "Mapa de Compatibilidade",
          description: "Gera um mapa visual de cada municipio integrado, mostrando o status de compatibilidade com a reforma e acoes necessarias.",
        },
        {
          icon: Code2,
          title: "Adaptadores por Provedor",
          description: "Gera adaptadores especificos para cada provedor (ABRASF, Betha, IPM) incluindo os novos campos CBS/IBS no formato correto.",
        },
        {
          icon: Globe,
          title: "Migracao para NFS-e Nacional",
          description: "Para municipios que adotarem o modelo nacional, gera o codigo de migracao completo com mapeamento de codigos de servico.",
        },
        {
          icon: Layers,
          title: "Camada de Abstracao",
          description: "Gera uma camada de abstracao unificada que normaliza as diferencas entre provedores, simplificando a manutencao futura.",
        },
        {
          icon: Settings,
          title: "Mapeamento de Codigos de Servico",
          description: "Mapeia os codigos de servico municipais (LC 116) para os novos codigos da reforma, gerando tabela de de-para.",
        },
        {
          icon: RefreshCw,
          title: "Monitor de Atualizacoes",
          description: "Acompanha quando cada provedor/municipio lanca atualizacoes para CBS/IBS, alertando sobre novas versoes de webservice.",
        },
        {
          icon: Building2,
          title: "Testes por Municipio",
          description: "Executa testes automatizados contra ambientes de homologacao de cada municipio para validar que a emissao funciona.",
        },
        {
          icon: FileText,
          title: "Relatorio de Cobertura Municipal",
          description: "Relatorio detalhado do status de cada municipio: versao do schema, compatibilidade CBS/IBS, e risco de rejeicao.",
        },
      ]}
      howItWorksTitle="Como funciona o NFS-e Harmonizer"
      howItWorksSteps={[
        {
          phase: "Fase 1 - Inventario",
          title: "Deteccao de todos os municipios integrados",
          description: "A IA escaneia o codigo e identifica cada integracao municipal: URLs de webservice, schemas XML, certificados, codigos de servico e provedores utilizados.",
        },
        {
          phase: "Fase 2 - Classificacao",
          title: "Agrupamento por provedor e schema",
          description: "Agrupa os municipios por provedor (ABRASF v2.04, Betha v3, IPM, etc) e identifica quais compartilham o mesmo schema e quais tem customizacoes.",
        },
        {
          phase: "Fase 3 - Gap Analysis",
          title: "Analise de compatibilidade CBS/IBS",
          description: "Para cada provedor, analisa o schema atual e identifica os campos que precisam ser adicionados para CBS/IBS, considerando as especificidades de cada um.",
        },
        {
          phase: "Fase 4 - Geracao",
          title: "Adaptadores e camada de abstracao",
          description: "Gera adaptadores especificos por provedor e uma camada de abstracao unificada que normaliza as diferencas entre municipios.",
        },
        {
          phase: "Fase 5 - Validacao",
          title: "Testes contra homologacao de cada municipio",
          description: "Envia notas de teste para os ambientes de homologacao de cada municipio, validando que os novos campos CBS/IBS sao aceitos corretamente.",
        },
      ]}
      benefits={[
        { value: "50+", label: "Municipios e provedores cobertos com adaptadores prontos" },
        { value: "1", label: "Interface unificada para todos os municipios via camada de abstracao" },
        { value: "90%", label: "Reducao no esforco de manter integracoes multi-municipais" },
        { value: "Auto", label: "Alertas quando provedores lancam novas versoes CBS/IBS" },
      ]}
      techStack={[
        {
          category: "Provedores Suportados",
          items: ["ABRASF (v2.03, v2.04)", "Betha Sistemas", "IPM Sistemas", "Fly e-Nota", "Tecnos", "Modelo Nacional (quando disponivel)"],
        },
        {
          category: "Formatos e Protocolos",
          items: ["SOAP / REST APIs", "XML Schema (XSD)", "Certificados A1/A3", "CNAB de retorno", "Webhooks de status"],
        },
        {
          category: "Integracoes",
          items: ["GitHub / GitLab / Azure DevOps", "Ambientes de homologacao municipais", "ERPs com modulo NFS-e", "Sistemas de emissao proprios"],
        },
      ]}
      ctaTitle="Simplifique o caos das NFS-e municipais"
      ctaDescription="O NFS-e Harmonizer detecta todos os municipios integrados, gera adaptadores por provedor e cria uma camada unificada. Menos manutencao, mais conformidade."
    />
  )
}
