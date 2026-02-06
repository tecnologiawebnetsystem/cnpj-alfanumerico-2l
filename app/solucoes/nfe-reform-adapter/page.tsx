import type { Metadata } from "next"
import { NfeReformAdapterContent } from "./content"

export const metadata: Metadata = {
  title: "NF-e Reform Adapter - ACT Digital | Adaptacao de Notas Fiscais Eletronicas",
  description:
    "Escaneia e adapta automaticamente seus sistemas de emissao de NF-e, NFC-e e CT-e para os novos campos CBS e IBS exigidos pela Reforma Tributaria 2026.",
}

export default function NfeReformAdapterPage() {
  return <NfeReformAdapterContent />
}
