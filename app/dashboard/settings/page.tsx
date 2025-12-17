import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Shield, Palette, Plug } from "lucide-react"
import { IntegrationsSettings } from "@/components/settings/integrations-settings"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Plug className="h-4 w-4" />
            <span className="hidden sm:inline">Integrações</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="profile">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações do Perfil</h3>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Segurança</h3>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Aparência</h3>
            <p className="text-muted-foreground">Em desenvolvimento...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
