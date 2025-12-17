import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ValidatorSection } from "@/components/landing/validator-section"
import { ExamplesSection } from "@/components/landing/examples-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { RoadmapSection } from "@/components/landing/roadmap-section"
import { CTASection } from "@/components/landing/cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ValidatorSection />
      <ExamplesSection />
      <FeaturesSection />
      <RoadmapSection />
      <CTASection />
      <Footer />
    </div>
  )
}
