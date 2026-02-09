import { InfraDocumentation } from "@/components/infra-docs/infra-documentation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentacao de Infraestrutura - CNPJ Detector | AWS & Azure",
  description:
    "Guia completo de infraestrutura para implantacao do CNPJ Detector em AWS e Azure com SQL Server",
}

export default function InfraDocsPage() {
  return <InfraDocumentation />
}
