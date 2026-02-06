"use client"

import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/landing/hero-section"
import { ValidatorSection } from "@/components/landing/validator-section"
import { ExamplesSection } from "@/components/landing/examples-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { RoadmapSection } from "@/components/landing/roadmap-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export function CnpjDetectorContent() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="pt-16 lg:pt-20">
        <HeroSection />
      </div>
      <ValidatorSection />
      <ExamplesSection />
      <FeaturesSection />
      <RoadmapSection />
      <CTASection />
      <Footer />
    </div>
  )
}
