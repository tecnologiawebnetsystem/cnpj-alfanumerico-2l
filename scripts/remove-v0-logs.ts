// Script to remove all [v0] logs from the codebase
// This will be executed to clean up debug logs

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs"
import { join } from "path"

function removeV0Logs(content: string): string {
  // Remove console.log with [v0]
  content = content.replace(/console\.log$$[^)]*\[v0\][^)]*$$;?\n?/g, "")

  // Remove console.error with [v0]
  content = content.replace(/console\.error$$[^)]*\[v0\][^)]*$$;?\n?/g, "")

  // Remove multi-line console statements with [v0]
  content = content.replace(/console\.(log|error)$$\s*['"]\[v0\][\s\S]*?$$;?\n?/g, "")

  // Remove comments with vercel or [v0]
  content = content.replace(/\/\/.*(\[v0\]|vercel).*\n/gi, "")

  // Remove empty lines that were left behind (more than 2 consecutive)
  content = content.replace(/\n{3,}/g, "\n\n")

  return content
}

function processFile(filePath: string) {
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
    return
  }

  try {
    const content = readFileSync(filePath, "utf-8")
    const cleaned = removeV0Logs(content)

    if (content !== cleaned) {
      writeFileSync(filePath, cleaned, "utf-8")
      console.log(`Cleaned: ${filePath}`)
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
  }
}

function processDirectory(dirPath: string) {
  const entries = readdirSync(dirPath)

  for (const entry of entries) {
    const fullPath = join(dirPath, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (!entry.includes("node_modules") && !entry.includes(".next")) {
        processDirectory(fullPath)
      }
    } else {
      processFile(fullPath)
    }
  }
}

// Start from app and components directories
processDirectory("./app")
processDirectory("./components")
processDirectory("./lib")

console.log("Cleanup complete!")
