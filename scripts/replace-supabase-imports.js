const { readFileSync, writeFileSync, readdirSync, statSync, existsSync } = require("fs")
const { join, resolve } = require("path")

// Try both possible root locations
const CANDIDATES = ["/vercel/share/v0-project", resolve(__dirname, "..")]
const BASE = CANDIDATES.find((p) => existsSync(join(p, "app"))) || CANDIDATES[0]
console.log("Using BASE:", BASE)
const DB_IMPORT = 'import { db as supabase } from "@/lib/db/sqlserver"\n'

// Recursively get all .ts files under a directory
function walkTs(dir) {
  const entries = readdirSync(dir)
  let results = []
  for (const entry of entries) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results = results.concat(walkTs(full))
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      results.push(full)
    }
  }
  return results
}

// Only process files under app/api and lib
const targets = [
  ...walkTs(join(BASE, "app/api")),
  ...walkTs(join(BASE, "lib")),
]

let totalChanged = 0

for (const filePath of targets) {
  let content
  try {
    content = readFileSync(filePath, "utf8")
  } catch {
    continue
  }

  // Skip files that don't reference @supabase packages directly
  if (
    !content.includes("@supabase/supabase-js") &&
    !content.includes("@supabase/ssr")
  ) {
    continue
  }

  const original = content

  // 1. Remove import lines from @supabase packages
  content = content.replace(/^import\s+[^\n]+from\s+['"]@supabase\/(supabase-js|ssr)['"]\s*\n?/gm, "")

  // 2. Remove getSupabaseClient/getSupabaseServiceClient function blocks (multi-line)
  content = content.replace(/\n?(?:export\s+)?function\s+getSupabase\w*\(\)[^{]*\{[\s\S]*?\n\}\n?/g, "\n")

  // 3. Replace inline createClient calls assigned to supabase variable
  content = content.replace(
    /(?:const|let)\s+supabase\s*=\s*(?:await\s+)?(?:createClient|createServerClient)\([^)]+(?:\([^)]*\)[^)]*)*\)\s*[;\n]/gm,
    ""
  )

  // 4. Replace remaining createClient / createServerClient calls to supabase (bare)
  content = content.replace(/(?:createClient|createServerClient)\([^)]+\)/g, "supabase")

  // 5. Replace getSupabaseClient() / getSupabaseServiceClient() remnants
  content = content.replace(/getSupabase\w+\(\)/g, "supabase")

  // 6. Add db import at very top if supabase is still referenced and not yet imported
  if (content.includes("supabase") && !content.includes("@/lib/db/sqlserver")) {
    if (content.startsWith('"use ') || content.startsWith("'use ")) {
      const nl = content.indexOf("\n")
      content = content.slice(0, nl + 1) + DB_IMPORT + content.slice(nl + 1)
    } else {
      content = DB_IMPORT + content
    }
  }

  if (content !== original) {
    writeFileSync(filePath, content, "utf8")
    const rel = filePath.replace(BASE + "/", "")
    console.log(`  UPDATED: ${rel}`)
    totalChanged++
  }
}

console.log(`\nDone. ${totalChanged} file(s) updated.`)
