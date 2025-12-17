"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { NotificationsPanel } from "@/components/notifications/notifications-panel"
import { ProfileDropdown } from "@/components/profile/profile-dropdown"
import { WorkerStatusIndicator } from "@/components/worker-status-indicator"

interface DashboardHeaderProps {
  user?: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/image.png"
              alt="CNPJ Detector by ACT Digital"
              width={200}
              height={60}
              className="h-auto w-auto max-h-[32px]"
              priority
            />
            <span className="hidden sm:inline text-sm font-medium text-muted-foreground">Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <NotificationsPanel />
            <WorkerStatusIndicator />
            <ProfileDropdown user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
