import { SiteHeader } from "@/components/site-header"
import { ReformaHero } from "@/components/reforma/hero"
import { PorQueReforma, OQueMuda, NovosImpostos } from "@/components/reforma/content-sections"
import { Timeline } from "@/components/reforma/timeline"
import { NaPratica, PrepareSection } from "@/components/reforma/prepare-section"
import { CTAAct } from "@/components/reforma/cta-act"
import { ReformaFooter } from "@/components/reforma/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <ReformaHero />
      <PorQueReforma />
      <OQueMuda />
      <NovosImpostos />
      <Timeline />
      <NaPratica />
      <PrepareSection />
      <CTAAct />
      <ReformaFooter />
    </div>
  )
}
