"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Upload, User, Lock, Palette, Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ProfileSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onUpdate: () => void
}

const THEME_COLORS = [
  { name: "Azul", value: "blue", class: "bg-blue-500" },
  { name: "Roxo", value: "purple", class: "bg-purple-500" },
  { name: "Verde", value: "green", class: "bg-green-500" },
  { name: "Laranja", value: "orange", class: "bg-orange-500" },
  { name: "Rosa", value: "pink", class: "bg-pink-500" },
  { name: "Vermelho", value: "red", class: "bg-red-500" },
]

export function ProfileSettingsDialog({ open, onOpenChange, user, onUpdate }: ProfileSettingsDialogProps) {
  const [name, setName] = useState(user?.name || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [themeColor, setThemeColor] = useState(user?.theme_color || "blue")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo é 5MB",
          variant: "destructive",
        })
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      let avatarUrl = user?.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData()
        formData.append("file", avatarFile)
        formData.append("userId", user.id)

        const uploadResponse = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          avatarUrl = uploadData.url
        } else {
          throw new Error("Erro ao fazer upload da imagem")
        }
      }

      // Update profile
      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatar_url: avatarUrl,
          theme_color: themeColor,
        }),
      })

      if (response.ok) {
        toast({
          title: "Perfil atualizado!",
          description: "Suas alterações foram salvas com sucesso.",
        })
        onUpdate()
        onOpenChange(false)
      } else {
        throw new Error("Erro ao atualizar perfil")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/profile/${user.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: "Senha alterada!",
          description: "Sua senha foi atualizada com sucesso.",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const error = await response.json()
        throw new Error(error.message || "Erro ao alterar senha")
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Perfil</DialogTitle>
          <DialogDescription>Personalize seu perfil, tema e segurança</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-4 border-primary/20">
                <AvatarImage src={avatarPreview || "/placeholder.svg"} alt={name} />
                <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                  {name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Alterar Foto
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <p className="text-xs text-muted-foreground">PNG, JPG ou GIF (máx. 5MB)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
            </div>

            <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-4">
            <div className="space-y-4">
              <Label>Cor do Tema</Label>
              <RadioGroup value={themeColor} onValueChange={setThemeColor}>
                <div className="grid grid-cols-3 gap-4">
                  {THEME_COLORS.map((color) => (
                    <div key={color.value} className="relative">
                      <RadioGroupItem value={color.value} id={color.value} className="peer sr-only" />
                      <Label
                        htmlFor={color.value}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary transition-all"
                      >
                        <div className={`h-12 w-12 rounded-full ${color.class} mb-2 shadow-lg`} />
                        <span className="text-sm font-medium">{color.name}</span>
                        {themeColor === color.value && (
                          <Check className="absolute top-2 right-2 h-5 w-5 text-primary" />
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
              {loading ? "Salvando..." : "Aplicar Tema"}
            </Button>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
