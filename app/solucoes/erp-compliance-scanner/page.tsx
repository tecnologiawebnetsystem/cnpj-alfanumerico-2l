import type { Metadata } from "next"
import { ErpComplianceScannerContent } from "./content"

export const metadata: Metadata = {
  title: "ERP Compliance Scanner - WebNetSystem | Diagnostico de Aderencia ERP",
  description:
    "Scanner especializado para ERPs (SAP, Oracle, TOTVS) que faz diagnostico completo de aderencia a reforma tributaria e gera roadmap de adequacao.",
}

export default function ErpComplianceScannerPage() {
  return <ErpComplianceScannerContent />
}
