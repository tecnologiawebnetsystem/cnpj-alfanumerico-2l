"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Settings, LogOut, Palette } from "lucide-react"
import { ProfileSettingsDialog } from "./profile-settings-dialog"

interface ProfileDropdownProps {
  user: any
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const router = useRouter()
  const [showProfileSettings, setShowProfileSettings] = useState(false)

  const handleLogout = async () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getRoleBadge = () => {
    switch (user?.role) {
      case "super_admin":
        return { label: "Super Admin", variant: "destructive" as const }
      case "admin":
        return { label: "Admin Cliente", variant: "default" as const }
      case "dev":
      case "developer":
        return { label: "Desenvolvedor", variant: "secondary" as const }
      default:
        return { label: "Usuário", variant: "outline" as const }
    }
  }

  const roleBadge = getRoleBadge()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.name || "User"} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Badge variant={roleBadge.variant} className="w-fit text-xs">
                {roleBadge.label}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
            <User className="mr-2 h-4 w-4" />
            Editar Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
            <Palette className="mr-2 h-4 w-4" />
            Tema e Cores
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSettingsDialog
        open={showProfileSettings}
        onOpenChange={setShowProfileSettings}
        user={user}
        onUpdate={() => {
          // Refresh user data
          window.location.reload()
        }}
      />
    </>
  )
}
