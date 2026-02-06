import type { Metadata } from "next"
import { FiscalDocumentValidatorContent } from "./content"

export const metadata: Metadata = {
  title: "Fiscal Document Validator - ACT Digital | Validacao de Documentos Fiscais",
  description:
    "Validador em tempo real de documentos fiscais eletronicos contra as novas regras da reforma tributaria. Simula o SEFAZ antes do envio.",
}

export default function FiscalDocumentValidatorPage() {
  return <FiscalDocumentValidatorContent />
}
