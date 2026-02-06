import type { Metadata } from "next"
import { DereBuilderContent } from "./content"

export const metadata: Metadata = {
  title: "DeRE Builder - ACT Digital | Declaracao dos Regimes Especificos",
  description:
    "Ferramenta para gerar e validar as novas Declaracoes dos Regimes Especificos (DeRE) para setores regulados: financeiro, saude, seguros e previdencia.",
}

export default function DereBuilderPage() {
  return <DereBuilderContent />
}
