"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("super_admin" | "admin" | "dev")[]
  fallbackUrl?: string
}

export function RoleGuard({ children, allowedRoles, fallbackUrl = "/login" }: RoleGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()

    if (!user) {
      router.push(fallbackUrl)
      return
    }

    if (!allowedRoles.includes(user.role)) {
      // Redirect based on role
      if (user.role === "super_admin") {
        router.push("/admin")
      } else if (user.role === "admin") {
        router.push("/dashboard")
      } else if (user.role === "dev") {
        router.push("/tasks")
      } else {
        router.push(fallbackUrl)
      }
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [allowedRoles, fallbackUrl, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
