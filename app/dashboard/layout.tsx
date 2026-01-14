"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { getCurrentUser } from "@/lib/auth"
import { Loader2 } from 'lucide-react'
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log(" Dashboard layout - checking auth")
    const user = getCurrentUser()

    if (!user) {
      console.log(" No user found, redirecting to login")
      router.push("/login")
      return
    }

    console.log(" User found:", user.email, "Role:", user.role)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <ChatbotWidget />
    </>
  )
}
