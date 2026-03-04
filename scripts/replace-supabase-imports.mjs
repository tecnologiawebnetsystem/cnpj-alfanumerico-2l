#!/usr/bin/env node
/**
 * scripts/replace-supabase-imports.mjs
 * Substitui imports diretos de @supabase/supabase-js e @supabase/ssr
 * pelo wrapper lib/db/sqlserver nas API routes restantes.
 */
import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

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

const BASE = resolve(process.cwd())

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

  // 1. Remove import lines from @supabase/supabase-js or @supabase/ssr
  content = content.replace(/^import\s+.*from\s+["']@supabase\/(supabase-js|ssr)["'].*\n?/gm, "")

  // 2. Remove getSupabaseClient function definition (multi-line)
  content = content.replace(
    /\n?function getSupabaseClient\(\)[^}]*\{[^}]*\}\n?/gs,
    "\n"
  )

  // 3. Replace local client creation patterns (createClient(...), createServerClient(...))
  content = content.replace(
    /(?:const|let)\s+supabase\s*=\s*(?:await\s+)?(?:createClient|createServerClient)\([^)]*\)[\s\S]*?\n/gm,
    "  // supabase bound from lib/db\n"
  )

  // 4. Replace all remaining getSupabaseClient() calls
  content = content.replace(/getSupabaseClient\(\)/g, "supabase")

  // 5. Add the db import at the top if supabase is still referenced and import not present
  if (content.includes("supabase") && !content.includes('@/lib/db/sqlserver')) {
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
