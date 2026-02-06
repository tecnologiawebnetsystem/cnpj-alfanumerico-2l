import Link from "next/link"
import Image from "next/image"

export function ReformaFooter() {
  return (
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="mb-4 rounded-xl overflow-hidden w-fit border border-border">
              <Image
                src="/images/act-logo-horizontal.jpeg"
                alt="ACT Digital"
                width={100}
                height={40}
                className="object-cover"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Solucoes tecnologicas para preparar sua empresa para a reforma tributaria e as mudancas regulatorias do
              Brasil.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Solucoes</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/solucoes/cnpj-detector", name: "CNPJ Detector" },
                { href: "/solucoes/nfe-reform-adapter", name: "NF-e Reform Adapter" },
                { href: "/solucoes/tax-rule-migrator", name: "Tax Rule Migrator" },
                { href: "/solucoes/split-payment-inspector", name: "Split Payment Inspector" },
                { href: "/solucoes/nfse-harmonizer", name: "NFS-e Harmonizer" },
                { href: "/solucoes/erp-compliance-scanner", name: "ERP Compliance Scanner" },
                { href: "/solucoes/fiscal-document-validator", name: "Fiscal Document Validator" },
                { href: "/solucoes/dere-builder", name: "DeRE Builder" },
              ].map((sol) => (
                <li key={sol.href}>
                  <Link href={sol.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {sol.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Conteudo</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#por-que" className="text-muted-foreground hover:text-foreground transition-colors">
                  Por que a reforma tributaria?
                </a>
              </li>
              <li>
                <a href="#novos-impostos" className="text-muted-foreground hover:text-foreground transition-colors">
                  IBS e CBS
                </a>
              </li>
              <li>
                <a href="#transicao" className="text-muted-foreground hover:text-foreground transition-colors">
                  Periodo de transicao
                </a>
              </li>
              <li>
                <a href="#preparar" className="text-muted-foreground hover:text-foreground transition-colors">
                  Como se preparar
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} ACT Digital. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs">
            Empresa especializada em transformacao digital e adequacao tributaria para o mercado brasileiro.
          </p>
        </div>
      </div>
    </footer>
  )
}
