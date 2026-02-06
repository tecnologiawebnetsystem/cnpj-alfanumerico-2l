import type { Metadata } from "next"
import { SplitPaymentInspectorContent } from "./content"

export const metadata: Metadata = {
  title: "Split Payment Inspector - ACT Digital | Adaptacao de Pagamentos",
  description:
    "Escaneia sistemas de pagamento e identifica os pontos que precisam ser adaptados para o mecanismo de split payment obrigatorio da reforma tributaria CBS/IBS.",
}

export default function SplitPaymentInspectorPage() {
  return <SplitPaymentInspectorContent />
}
