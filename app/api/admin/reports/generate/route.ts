import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")
  const format = searchParams.get("format")
  const clientId = searchParams.get("clientId")
  const devId = searchParams.get("devId")

  console.log(` Generating ${type} report in ${format} format, clientId: ${clientId}, devId: ${devId}`)

  try {
    const supabase = await createServerClient()

    let content = ""
    let filename = `relatorio-${type}-${new Date().toISOString().split("T")[0]}`

    if (type === "clientes") {
      let query = supabase.from("clients").select("*").order("created_at", { ascending: false })

      if (clientId && clientId !== "all") {
        query = query.eq("id", clientId)
      }

      const { data: clients, error } = await query

      if (error) throw error

      if (format === "excel") {
        content = "ID,Nome,CNPJ,Email,Plano,Status,Licença Válida Até,Criado Em\n"
        clients?.forEach((client) => {
          content += `${client.id},"${client.name}","${client.cnpj}","${client.email}","${client.plan || ""}","${client.status}","${client.license_valid_until || ""}","${client.created_at}"\n`
        })
        filename += ".csv"
      } else {
        content = "=== RELATÓRIO DE CLIENTES ===\n\n"
        content += `Data: ${new Date().toLocaleString("pt-BR")}\n`
        content += `Total de Clientes: ${clients?.length || 0}\n\n`
        clients?.forEach((client, index) => {
          content += `\n--- Cliente ${index + 1} ---\n`
          content += `Nome: ${client.name}\n`
          content += `CNPJ: ${client.cnpj}\n`
          content += `Email: ${client.email}\n`
          content += `Plano: ${client.plan || "N/A"}\n`
          content += `Status: ${client.status}\n`
          content += `Licença válida até: ${client.license_valid_until || "N/A"}\n`
          content += `Criado em: ${new Date(client.created_at).toLocaleString("pt-BR")}\n`
        })
        filename += ".txt"
      }
    } else if (type === "licencas") {
      let query = supabase
        .from("clients")
        .select("id, name, cnpj, plan, license_valid_until, status")
        .order("license_valid_until", { ascending: true })

      if (clientId && clientId !== "all") {
        query = query.eq("id", clientId)
      }

      const { data: clients, error } = await query

      if (error) throw error

      if (format === "excel") {
        content = "Cliente,CNPJ,Plano,Licença Válida Até,Status,Dias Restantes\n"
        clients?.forEach((client) => {
          const daysRemaining = client.license_valid_until
            ? Math.ceil((new Date(client.license_valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : "N/A"
          content += `"${client.name}","${client.cnpj}","${client.plan || ""}","${client.license_valid_until || "N/A"}","${client.status}","${daysRemaining}"\n`
        })
        filename += ".csv"
      } else {
        content = "=== RELATÓRIO DE LICENÇAS ===\n\n"
        content += `Data: ${new Date().toLocaleString("pt-BR")}\n`
        content += `Total de Licenças: ${clients?.length || 0}\n\n`
        clients?.forEach((client, index) => {
          const daysRemaining = client.license_valid_until
            ? Math.ceil((new Date(client.license_valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : "N/A"
          content += `\n--- Licença ${index + 1} ---\n`
          content += `Cliente: ${client.name}\n`
          content += `CNPJ: ${client.cnpj}\n`
          content += `Plano: ${client.plan || "N/A"}\n`
          content += `Válida até: ${client.license_valid_until ? new Date(client.license_valid_until).toLocaleDateString("pt-BR") : "N/A"}\n`
          content += `Status: ${client.status}\n`
          content += `Dias restantes: ${daysRemaining}\n`
        })
        filename += ".txt"
      }
    } else if (type === "analises") {
      let query = supabase
        .from("analyses")
        .select(`
          *,
          clients:client_id (name, cnpj),
          users:user_id (name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(100)

      if (clientId && clientId !== "all") {
        query = query.eq("client_id", clientId)
      }

      if (devId && devId !== "all") {
        query = query.eq("user_id", devId)
      }

      const { data: analyses, error } = await query

      if (error) throw error

      if (format === "excel") {
        content = "ID,Cliente,CNPJ Cliente,Dev,Email Dev,CNPJ Analisado,Status,Criado Em\n"
        analyses?.forEach((analysis) => {
          content += `${analysis.id},"${analysis.clients?.name || "N/A"}","${analysis.clients?.cnpj || "N/A"}","${analysis.users?.name || "N/A"}","${analysis.users?.email || "N/A"}","${analysis.cnpj}","${analysis.status}","${analysis.created_at}"\n`
        })
        filename += ".csv"
      } else {
        content = "=== RELATÓRIO DE ANÁLISES ===\n\n"
        content += `Data: ${new Date().toLocaleString("pt-BR")}\n`
        content += `Total de Análises: ${analyses?.length || 0}\n\n`
        analyses?.forEach((analysis, index) => {
          content += `\n--- Análise ${index + 1} ---\n`
          content += `Cliente: ${analysis.clients?.name || "N/A"}\n`
          content += `CNPJ Cliente: ${analysis.clients?.cnpj || "N/A"}\n`
          content += `Dev: ${analysis.users?.name || "N/A"}\n`
          content += `Email Dev: ${analysis.users?.email || "N/A"}\n`
          content += `CNPJ Analisado: ${analysis.cnpj}\n`
          content += `Status: ${analysis.status}\n`
          content += `Criado em: ${new Date(analysis.created_at).toLocaleString("pt-BR")}\n`
        })
        filename += ".txt"
      }
    } else if (type === "financeiro") {
      let query = supabase
        .from("clients")
        .select("name, cnpj, plan, status, created_at")
        .order("name", { ascending: true })

      if (clientId && clientId !== "all") {
        query = query.eq("id", clientId)
      }

      const { data: clients, error } = await query

      if (error) throw error

      const planPrices: Record<string, number> = {
        basic: 99.9,
        professional: 299.9,
        enterprise: 999.9,
      }

      if (format === "excel") {
        content = "Cliente,CNPJ,Plano,Valor Mensal,Status,Faturamento Anual Estimado\n"
        let totalAnual = 0
        clients?.forEach((client) => {
          const valor = planPrices[client.plan || "basic"] || 0
          const anual = valor * 12
          totalAnual += anual
          content += `"${client.name}","${client.cnpj}","${client.plan || "basic"}","R$ ${valor.toFixed(2)}","${client.status}","R$ ${anual.toFixed(2)}"\n`
        })
        content += `\n"TOTAL","","","","","R$ ${totalAnual.toFixed(2)}"`
        filename += ".csv"
      } else {
        content = "=== RELATÓRIO FINANCEIRO ===\n\n"
        content += `Data: ${new Date().toLocaleString("pt-BR")}\n`
        content += `Total de Clientes Ativos: ${clients?.filter((c) => c.status === "active").length || 0}\n\n`

        let totalMensal = 0
        let totalAnual = 0

        clients?.forEach((client, index) => {
          const valor = planPrices[client.plan || "basic"] || 0
          const anual = valor * 12
          totalMensal += valor
          totalAnual += anual

          content += `\n--- Cliente ${index + 1} ---\n`
          content += `Nome: ${client.name}\n`
          content += `CNPJ: ${client.cnpj}\n`
          content += `Plano: ${client.plan || "basic"}\n`
          content += `Valor Mensal: R$ ${valor.toFixed(2)}\n`
          content += `Faturamento Anual Estimado: R$ ${anual.toFixed(2)}\n`
          content += `Status: ${client.status}\n`
        })

        content += `\n\n=== RESUMO FINANCEIRO ===\n`
        content += `Faturamento Mensal Total: R$ ${totalMensal.toFixed(2)}\n`
        content += `Faturamento Anual Estimado: R$ ${totalAnual.toFixed(2)}\n`
        filename += ".txt"
      }
    } else {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": format === "excel" ? "text/csv" : "text/plain",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error(" Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
