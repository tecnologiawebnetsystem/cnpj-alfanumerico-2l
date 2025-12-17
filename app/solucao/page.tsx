import { AboutSection } from "@/components/landing/about-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { BenefitsSection } from "@/components/landing/benefits-section"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function SolucaoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AboutSection />
        <FeaturesSection />
        <BenefitsSection />
      </main>
      <Footer />
    </div>
  )
}
