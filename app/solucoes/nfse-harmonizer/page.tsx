import type { Metadata } from "next"
import { NfseHarmonizerContent } from "./content"

export const metadata: Metadata = {
  title: "NFS-e Municipality Harmonizer - WebNetSystem | Compatibilizacao Municipal",
  description:
    "Mapeia e compatibiliza as diferentes integracoes municipais de NFS-e (Nota Fiscal de Servico Eletronica) para a reforma tributaria 2026.",
}

export default function NfseHarmonizerPage() {
  return <NfseHarmonizerContent />
}
