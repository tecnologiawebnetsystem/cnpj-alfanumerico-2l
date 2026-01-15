import { createClient } from "@/lib/supabase"

export async function isIPWhitelisted(ip: string, clientId: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("ip_whitelist")
    .select("ip_address, is_active")
    .eq("client_id", clientId)
    .eq("is_active", true)

  if (error || !data || data.length === 0) {
    // If no whitelist configured, allow all (backwards compatibility)
    return true
  }

  // Check if IP matches any whitelisted entry
  return data.some((entry) => {
    if (entry.ip_address === ip) return true
    // Support CIDR notation (basic check)
    if (entry.ip_address.includes("/")) {
      const [network, bits] = entry.ip_address.split("/")
      // Simplified CIDR check - for production use a proper library
      return ip.startsWith(
        network
          .split(".")
          .slice(0, Math.floor(Number(bits) / 8))
          .join("."),
      )
    }
    return false
  })
}
