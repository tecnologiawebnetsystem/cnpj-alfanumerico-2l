"use client"

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle,
  Calendar,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface TimelineStep {
  phase: string
  title: string
  description: string
}

interface Benefit {
  label: string
  value: string
}

interface TechItem {
  category: string
  items: string[]
}

export interface SolutionPageProps {
  badge: string
  badgeIcon: LucideIcon
  title: string
  titleHighlight: string
  subtitle: string
  description: string
  heroFeatures: { icon: LucideIcon; text: string; detail: string }[]
  heroStats: { icon: LucideIcon; label: string }[]
  problemTitle: string
  problemDescription: string
  problemPoints: string[]
  features: Feature[]
  howItWorksTitle: string
  howItWorksSteps: TimelineStep[]
  benefits: Benefit[]
  techStack: TechItem[]
  ctaTitle: string
  ctaDescription: string
  accentColor: string
  accentColorLight: string
}

export function SolutionPageLayout({
  badge,
  badgeIcon: BadgeIcon,
  title,
  titleHighlight,
  subtitle,
  description,
  heroFeatures,
  heroStats,
  problemTitle,
  problemDescription,
  problemPoints,
  features,
  howItWorksTitle,
  howItWorksSteps,
  benefits,
  techStack,
  ctaTitle,
  ctaDescription,
  accentColor,
  accentColorLight,
}: SolutionPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FFF5E6] to-background" />
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 right-0 w-1/2 h-1/2"
            style={{ background: `linear-gradient(to bottom left, ${accentColorLight}, transparent)` }}
          />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#0052CC]/5 to-transparent" />
        </div>

        <div className="container relative mx-auto px-6 lg:px-8 pt-28 lg:pt-36 pb-20">
          <div className="max-w-4xl mx-auto">
            <Badge
              className="gap-2 font-medium mb-8"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}30`,
                color: accentColor,
              }}
            >
              <BadgeIcon className="h-3.5 w-3.5" />
              {badge}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4">
              <span className="text-foreground">{title}</span>{" "}
              <span style={{ color: accentColor }}>{titleHighlight}</span>
            </h1>

            <p className="text-xl md:text-2xl font-medium mb-6" style={{ color: accentColor }}>
              {subtitle}
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-10">
              {description}
            </p>

            <div className="space-y-4 mb-10">
              {heroFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <feat.icon className="h-6 w-6" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <span className="text-foreground font-medium">{feat.text}</span>
                    <p className="text-sm text-muted-foreground">{feat.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md">
              {heroStats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-5 rounded-xl bg-card shadow-sm border border-border"
                >
                  <stat.icon className="h-7 w-7 mx-auto mb-2" style={{ color: accentColor }} />
                  <p className="text-sm font-medium text-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-balance">
              {problemTitle}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {problemDescription}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {problemPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: accentColor }} />
                  <span className="text-foreground text-sm leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              O que a solucao oferece
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Recursos completos desenvolvidos pela WebNetSystem para garantir conformidade total
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all border border-border bg-card">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <feature.icon className="h-7 w-7" style={{ color: accentColor }} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              {howItWorksTitle}
            </h2>

            <div className="space-y-0">
              {howItWorksSteps.map((step, i) => (
                <div key={i} className="relative flex gap-6">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10"
                      style={{ backgroundColor: accentColor, color: "#fff" }}
                    >
                      {i + 1}
                    </div>
                    {i < howItWorksSteps.length - 1 && (
                      <div className="w-0.5 h-full min-h-16" style={{ backgroundColor: `${accentColor}30` }} />
                    )}
                  </div>

                  <div className="pb-12">
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: accentColor }}
                    >
                      {step.phase}
                    </span>
                    <h3 className="text-xl font-bold mt-1 mb-2 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              Beneficios para sua empresa
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border shadow-sm">
                  <div
                    className="text-3xl font-bold shrink-0"
                    style={{ color: accentColor }}
                  >
                    {benefit.value}
                  </div>
                  <span className="text-foreground font-medium">{benefit.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
              Tecnologias e integracao
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map((tech, i) => (
                <Card key={i} className="p-6 border border-border bg-card">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: accentColor }}>
                    {tech.category}
                  </h3>
                  <ul className="space-y-2">
                    {tech.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Calendar className="h-4 w-4" style={{ color: accentColor }} />
              <span className="text-sm font-medium" style={{ color: accentColor }}>
                Reforma Tributaria 2026
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-balance">
              {ctaTitle}
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
              {ctaDescription}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="text-base font-semibold px-8 shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                <Link href="/#contato">
                  Falar com um Especialista
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base font-medium px-8"
              >
                <Link href="/solucoes/cnpj-detector">
                  Ver outras solucoes
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>IA Integrada</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>WebNetSystem</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2025 WebNetSystem. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Reforma Tributaria
              </Link>
              <Link href="/solucoes/cnpj-detector" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                CNPJ Detector
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
