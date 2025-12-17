"use client"

import { getCurrentUser } from "./auth"

export interface LicenseStatus {
  isActive: boolean
  isExpired: boolean
  daysRemaining: number | null
  licenseEnd: string | null
  clientName: string
}

export async function checkLicense(): Promise<LicenseStatus | null> {
  const user = getCurrentUser()

  // Super admin não tem restrição de licença
  if (user?.role === "super_admin") {
    return {
      isActive: true,
      isExpired: false,
      daysRemaining: null,
      licenseEnd: null,
      clientName: "Super Admin",
    }
  }

  if (!user?.client_id) {
    return null
  }

  try {
    const response = await fetch(`/api/clients/${user.client_id}/license`)
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao verificar licença:", error)
    return null
  }
}

export function useLicenseCheck() {
  const checkAndRedirect = async () => {
    const license = await checkLicense()

    if (!license) {
      return false
    }

    if (!license.isActive || license.isExpired) {
      window.location.href = "/license-expired"
      return false
    }

    return true
  }

  return { checkAndRedirect }
}
