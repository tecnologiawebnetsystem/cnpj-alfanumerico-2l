import { simpleGit } from "simple-git"
import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"

export async function cloneRepositoryLocally(
  repo: any,
  accessToken: string,
  provider: string,
  allowedExtensions: string[],
): Promise<Array<{ name: string; content: string; path: string; project?: string; repository?: string }>> {
  const files: Array<{ name: string; content: string; path: string; project?: string; repository?: string }> = []
  const tempDir = path.join("/tmp", `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  try {
    console.log(`[v0] Cloning repository ${repo.name} to ${tempDir}...`)

    // Prepare clone URL based on provider
    let cloneUrl = ""
    if (provider === "azure") {
      const remoteUrl = repo.remoteUrl || repo.url || repo.html_url
      cloneUrl = remoteUrl
    } else {
      // GitHub
      cloneUrl =
        repo.clone_url || `https://github.com/${repo.owner?.login || repo.full_name?.split("/")[0]}/${repo.name}.git`
    }

    // Add authentication to clone URL
    let authenticatedUrl = cloneUrl
    if (provider === "azure") {
      // Azure: use token as password
      authenticatedUrl = cloneUrl.replace("https://", `https://PAT:${accessToken}@`)
    } else {
      // GitHub: use token
      authenticatedUrl = cloneUrl.replace("https://", `https://oauth2:${accessToken}@`)
    }

    // Clone repository
    const git = simpleGit()
    await git.clone(authenticatedUrl, tempDir, ["--depth", "1"])

    console.log(`[v0] Repository cloned successfully to ${tempDir}`)

    // Walk through directory and find files matching extensions
    const walkDir = (dir: string, relativePath = "") => {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        // Skip .git and other hidden directories
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue

        const fullPath = path.join(dir, entry.name)
        const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name

        if (entry.isDirectory()) {
          walkDir(fullPath, relPath)
        } else if (entry.isFile()) {
          const fileExt = path.extname(entry.name).toLowerCase()
          if (allowedExtensions.includes(fileExt)) {
            try {
              const content = fs.readFileSync(fullPath, "utf-8")
              files.push({
                name: entry.name,
                content: content,
                path: relPath,
                project:
                  provider === "azure" ? repo.project || repo.name : repo.owner?.login || repo.full_name?.split("/")[0],
                repository: repo.name,
              })
            } catch (error) {
              console.error(`[v0] Error reading file ${fullPath}:`, error)
            }
          }
        }
      }
    }

    walkDir(tempDir)
    console.log(`[v0] Found ${files.length} files matching extensions: ${allowedExtensions.join(", ")}`)

    return files
  } catch (error) {
    console.error(`[v0] Error cloning/analyzing repository ${repo.name}:`, error)
    return files
  } finally {
    // Clean up temporary directory
    try {
      if (fs.existsSync(tempDir)) {
        console.log(`[v0] Cleaning up temporary directory ${tempDir}...`)
        execSync(`rm -rf "${tempDir}"`, { stdio: "ignore" })
        console.log(`[v0] Temporary directory cleaned up`)
      }
    } catch (cleanupError) {
      console.error(`[v0] Error cleaning up temporary directory ${tempDir}:`, cleanupError)
    }
  }
}
