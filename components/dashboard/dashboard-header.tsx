"use client"

import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { NotificationsPanel } from "@/components/notifications/notifications-panel"
import { ProfileDropdown } from "@/components/profile/profile-dropdown"

interface DashboardHeaderProps {
  user?: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-card">
      <div className="h-full px-4 lg:px-6">
        <div className="flex h-full items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/image.png"
              alt="CNPJ Detector"
              width={180}
              height={50}
              className="h-8 w-auto"
              priority
            />
            <div className="hidden md:flex items-center gap-2">
              <span className="text-border">/</span>
              <span className="text-sm font-medium text-foreground">Dashboard</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <NotificationsPanel />
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            <ProfileDropdown user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
