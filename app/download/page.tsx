"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Smartphone, 
  Monitor, 
  Apple, 
  Chrome,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Share,
  MoreVertical,
  PlusSquare,
  Settings,
  ExternalLink,
  Sparkles,
  Shield,
  Zap,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function DownloadPage() {
  const [activeTab, setActiveTab] = useState("android")

  const features = [
    { icon: Zap, title: "Acesso Rapido", description: "Abra direto do seu celular ou desktop" },
    { icon: Bell, title: "Notificacoes", description: "Receba alertas mesmo com o app fechado" },
    { icon: Shield, title: "Seguro", description: "Seus dados protegidos com criptografia" },
    { icon: Sparkles, title: "Sempre Atualizado", description: "Atualizacoes automaticas sem precisar baixar" },
  ]

  const androidSteps = [
    {
      step: 1,
      title: "Abra o Chrome",
      description: "Acesse o site pelo navegador Google Chrome no seu celular Android",
      icon: Chrome,
      tip: "O Chrome e o navegador recomendado para melhor experiencia"
    },
    {
      step: 2,
      title: "Acesse o Menu",
      description: "Toque nos tres pontinhos (⋮) no canto superior direito do Chrome",
      icon: MoreVertical,
      tip: "O menu fica ao lado da barra de endereco"
    },
    {
      step: 3,
      title: "Instalar Aplicativo",
      description: "Selecione 'Instalar aplicativo' ou 'Adicionar a tela inicial'",
      icon: Download,
      tip: "Se nao aparecer, role o menu para baixo"
    },
    {
      step: 4,
      title: "Confirme a Instalacao",
      description: "Toque em 'Instalar' no popup que aparecer",
      icon: CheckCircle2,
      tip: "O app sera adicionado a sua tela inicial automaticamente"
    },
  ]

  const iosSteps = [
    {
      step: 1,
      title: "Abra o Safari",
      description: "Acesse o site pelo navegador Safari no seu iPhone ou iPad",
      icon: Apple,
      tip: "IMPORTANTE: Deve ser o Safari, outros navegadores nao funcionam"
    },
    {
      step: 2,
      title: "Toque em Compartilhar",
      description: "Toque no icone de compartilhamento (quadrado com seta para cima) na barra inferior",
      icon: Share,
      tip: "O icone fica na parte de baixo da tela"
    },
    {
      step: 3,
      title: "Adicionar a Tela Inicial",
      description: "Role as opcoes e toque em 'Adicionar a Tela de Inicio'",
      icon: PlusSquare,
      tip: "Pode ser necessario rolar para a direita para encontrar"
    },
    {
      step: 4,
      title: "Confirme o Nome",
      description: "Verifique o nome do app e toque em 'Adicionar'",
      icon: CheckCircle2,
      tip: "O icone aparecera na sua tela inicial como qualquer outro app"
    },
  ]

  const desktopSteps = [
    {
      step: 1,
      title: "Abra o Chrome ou Edge",
      description: "Acesse o site pelo Google Chrome ou Microsoft Edge no seu computador",
      icon: Chrome,
      tip: "Firefox nao suporta instalacao de PWA"
    },
    {
      step: 2,
      title: "Clique no Icone de Instalacao",
      description: "Na barra de endereco, clique no icone de instalacao (computador com seta)",
      icon: Download,
      tip: "O icone aparece do lado direito da barra de endereco"
    },
    {
      step: 3,
      title: "Confirme a Instalacao",
      description: "Clique em 'Instalar' no popup que aparecer",
      icon: CheckCircle2,
      tip: "O Chrome pode perguntar se deseja criar atalho na area de trabalho"
    },
    {
      step: 4,
      title: "Abra o Aplicativo",
      description: "O app abrira automaticamente. Voce pode encontra-lo no menu Iniciar ou na pasta Aplicativos",
      icon: Monitor,
      tip: "No Windows, procure por 'CNPJ' no menu Iniciar"
    },
  ]

  const renderSteps = (steps: typeof androidSteps) => (
    <div className="space-y-4">
      {steps.map((item, index) => (
        <div 
          key={item.step}
          className="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
        >
          <div className="flex items-start gap-4">
            {/* Step Number */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {item.step}
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                {item.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-1.5 w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{item.tip}</span>
              </div>
            </div>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="absolute left-[2.25rem] top-[4.5rem] w-0.5 h-8 bg-gradient-to-b from-blue-300 to-transparent dark:from-blue-500/50" />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-blue-900/10 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl blur-sm opacity-40" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl p-2">
                    <Download className="h-4 w-4 text-white" />
                  </div>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Baixar App
                </span>
              </div>
            </Link>
            
            <Link href="/login">
              <Button variant="outline" className="gap-2 bg-transparent">
                <ExternalLink className="h-4 w-4" />
                Acessar pelo Navegador
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            Gratis para Instalar
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Instale o{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
              CNPJ Alfanumerico
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Acesse suas tarefas e dashboards diretamente do seu celular ou computador, 
            como se fosse um aplicativo nativo. Sem ocupar espaco, sempre atualizado!
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50"
              >
                <feature.icon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900 dark:text-white text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="max-w-3xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-auto p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8">
              <TabsTrigger 
                value="android" 
                className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.523 2.582a.75.75 0 0 0-1.046 1.072l1.14 1.11a6.5 6.5 0 0 0-11.234 0l1.14-1.11a.75.75 0 1 0-1.046-1.072L4.5 4.5a8 8 0 0 0-2.5 5.5v7a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5v-7a8 8 0 0 0-2.5-5.5l-1.977-1.918zM8.5 11a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                </svg>
                <span className="font-medium">Android</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ios" 
                className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all"
              >
                <Apple className="h-5 w-5" />
                <span className="font-medium">iPhone/iPad</span>
              </TabsTrigger>
              <TabsTrigger 
                value="desktop" 
                className="flex items-center gap-2 py-3 rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all"
              >
                <Monitor className="h-5 w-5" />
                <span className="font-medium">Desktop</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="android" className="mt-0">
              <Card className="border-0 shadow-xl shadow-blue-500/5 bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
                      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.523 2.582a.75.75 0 0 0-1.046 1.072l1.14 1.11a6.5 6.5 0 0 0-11.234 0l1.14-1.11a.75.75 0 1 0-1.046-1.072L4.5 4.5a8 8 0 0 0-2.5 5.5v7a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5v-7a8 8 0 0 0-2.5-5.5l-1.977-1.918zM8.5 11a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl">Instalar no Android</CardTitle>
                      <CardDescription>Siga os passos abaixo usando o Google Chrome</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {renderSteps(androidSteps)}
                  
                  <div className="mt-8 p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Pronto!
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400/80">
                      O app CNPJ Alfanumerico agora esta na sua tela inicial. 
                      Ao abrir, voce ira direto para a tela de login!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ios" className="mt-0">
              <Card className="border-0 shadow-xl shadow-blue-500/5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-500/30">
                      <Apple className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Instalar no iPhone/iPad</CardTitle>
                      <CardDescription>Siga os passos abaixo usando o Safari</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium mb-1">
                      <Apple className="h-5 w-5" />
                      Importante
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-400/80">
                      No iOS, a instalacao de apps web so funciona pelo Safari. 
                      Chrome e outros navegadores nao permitem essa opcao.
                    </p>
                  </div>
                  
                  {renderSteps(iosSteps)}
                  
                  <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Pronto!
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      O icone do app aparecera na sua tela inicial do iPhone/iPad.
                      Ao tocar, abrira em tela cheia como um app nativo!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="desktop" className="mt-0">
              <Card className="border-0 shadow-xl shadow-blue-500/5 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Instalar no Computador</CardTitle>
                      <CardDescription>Windows, Mac ou Linux usando Chrome ou Edge</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {renderSteps(desktopSteps)}
                  
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-medium mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Pronto!
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400/80">
                      O app abrira em uma janela propria, sem barra de navegacao.
                      Voce pode fixa-lo na barra de tarefas para acesso rapido!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
          Perguntas Frequentes
        </h2>
        
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Preciso baixar algo da loja de apps?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Nao! O app e instalado diretamente pelo navegador, sem precisar ir na Play Store ou App Store.
              Isso se chama PWA (Progressive Web App) e funciona como um app nativo.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              O app ocupa muito espaco no celular?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Muito pouco! Como e um app web, ele ocupa apenas alguns megabytes para cache,
              muito menos que apps tradicionais.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Como desinstalar o app?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Da mesma forma que qualquer outro app: no Android/iOS, segure o icone e selecione "Remover".
              No desktop, va em Configuracoes do Chrome e Apps instalados.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              O app funciona offline?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Parcialmente. Voce pode abrir o app offline, mas para ver dados atualizados e 
              realizar acoes, precisa de conexao com a internet.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Prefere acessar pelo navegador?
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30">
              Acessar Agora
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
