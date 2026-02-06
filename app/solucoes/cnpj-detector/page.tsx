import type { Metadata } from "next"
import { CnpjDetectorContent } from "./cnpj-detector-content"

export const metadata: Metadata = {
  title: "CNPJ Detector - ACT Digital | Migracao para CNPJ Alfanumerico",
  description:
    "Solucao completa para analise e migracao de sistemas para o novo formato de CNPJ Alfanumerico, obrigatorio a partir de julho de 2026. Analise automatizada, relatorios detalhados e suporte especializado.",
}

export default function CnpjDetectorPage() {
  return <CnpjDetectorContent />
}
