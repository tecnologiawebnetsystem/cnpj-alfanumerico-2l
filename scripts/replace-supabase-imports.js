/**
 * scripts/replace-supabase-imports.js
 * Substitui imports diretos de @supabase/supabase-js e @supabase/ssr
 * pelo wrapper lib/db/sqlserver nas API routes restantes.
 */
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

const files = [
  "app/api/v1/reports/[id]/route.ts",
  "app/api/v1/analyze/[id]/route.ts",
  "app/api/tasks/sync-external/route.ts",
  "app/api/tasks/azure-sync/route.ts",
  "app/api/tasks/azure-devops/route.ts",
  "app/api/reports/templates/route.ts",
  "app/api/reports/scheduled/route.ts",
  "app/api/reports/scheduled/[id]/route.ts",
  "app/api/reports/comparison/route.ts",
  "app/api/reports/analytics/route.ts",
  "app/api/reports/[id]/route.ts",
  "app/api/errors/[id]/route.ts",
  "app/api/profile/avatar/route.ts",
  "app/api/client/tasks/[taskId]/route.ts",
  "app/api/notifications/preferences/route.ts",
  "app/api/dev/tasks/[id]/route.ts",
  "app/api/admin/cleanup-client-tasks/route.ts",
  "app/api/analyses/[id]/route.ts",
  "app/api/ai/enrich-findings/route.ts",
  "app/api/accounts/[id]/route.ts",
]

const BASE = resolve(__dirname, "..")

let totalChanged = 0

for (const rel of files) {
  const filePath = resolve(BASE, rel)
  let content

  try {
    content = readFileSync(filePath, "utf8")
  } catch {
    console.log(`  SKIP (not found): ${rel}`)
    continue
  }

  const original = content

  // 1. Remove import lines from @supabase packages
  content = content.replace(/^import\s+[^\n]*from\s+["']@supabase\/(supabase-js|ssr)["'][^\n]*\n?/gm, "")

  // 2. Remove getSupabaseClient function definition
  content = content.replace(/\n?function getSupabaseClient\(\)\s*\{[^}]*\}\n?/g, "\n")

  // 3. Replace getSupabaseClient() calls
  content = content.replace(/getSupabaseClient\(\)/g, "supabase")

  // 4. Replace inline createClient/createServerClient (simple one-liner assignments)
  content = content.replace(
    /(?:const|let)\s+supabase\s*=\s*(?:await\s+)?(?:createClient|createServerClient)\([^;]+\);?\n?/gm,
    "// supabase = db (bound from @/lib/db/sqlserver)\n"
  )

  // 5. Add import at top if supabase is still used
  if (content.includes("supabase") && !content.includes("@/lib/db/sqlserver")) {
    content = `import { db as supabase } from "@/lib/db/sqlserver"\n` + content
  }

  if (content !== original) {
    writeFileSync(filePath, content, "utf8")
    console.log(`  UPDATED: ${rel}`)
    totalChanged++
  } else {
    console.log(`  NO CHANGE: ${rel}`)
  }
}

console.log(`\nDone. ${totalChanged} file(s) updated.`)
