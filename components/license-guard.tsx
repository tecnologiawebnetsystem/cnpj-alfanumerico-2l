"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { checkLicense } from "@/lib/license-checker"
import { Loader2 } from "lucide-react"

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const verify = async () => {
      const license = await checkLicense()

      if (!license) {
        router.push("/login")
        return
      }

      if (!license.isActive || license.isExpired) {
        router.push("/license-expired")
        return
      }

      setIsValid(true)
      setIsChecking(false)
    }

    verify()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando licença...</p>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return null
  }

  return <>{children}</>
}
