import type { Metadata } from "next"
import { TaxRuleMigratorContent } from "./content"

export const metadata: Metadata = {
  title: "Tax Rule Migrator - ACT Digital | Migracao de Regras Tributarias",
  description:
    "Analisa a logica de calculo tributario nos seus sistemas e mapeia as regras de PIS/COFINS/ICMS/ISS para CBS/IBS/IS com suporte ao periodo de transicao 2026-2033.",
}

export default function TaxRuleMigratorPage() {
  return <TaxRuleMigratorContent />
}
