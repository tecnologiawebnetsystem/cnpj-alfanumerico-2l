import { Octokit } from "@octokit/rest"

export async function extractFromGitHub(githubUrl: string, token?: string): Promise<Map<string, string>> {
  console.log(` Extracting from GitHub: ${githubUrl}`)

  // Parse GitHub URL to get owner and repo
  const urlPattern = /github\.com\/([^/]+)\/([^/]+)/
  const match = githubUrl.match(urlPattern)

  if (!match) {
    throw new Error("Invalid GitHub URL format")
  }

  const [, owner, repo] = match
  console.log(` Owner: ${owner}, Repo: ${repo}`)

  const octokit = new Octokit({
    auth: token || process.env.GITHUB_TOKEN,
  })

  const filesMap = new Map<string, string>()

  // Get repository content recursively
  async function getContents(path = "") {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      })

      if (Array.isArray(data)) {
        // Directory listing
        for (const item of data) {
          if (item.type === "file" && shouldIncludeFile(item.path)) {
            await getFileContent(item.path)
          } else if (item.type === "dir" && !shouldIgnoreDir(item.path)) {
            await getContents(item.path)
          }
        }
      } else if (data.type === "file") {
        // Single file
        await getFileContent(data.path)
      }
    } catch (error) {
      console.error(` Error getting contents for ${path}:`, error)
    }
  }

  async function getFileContent(filePath: string) {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
      })

      if ("content" in data && data.content) {
        const content = Buffer.from(data.content, "base64").toString("utf-8")
        filesMap.set(filePath, content)
        console.log(` ✓ Extracted: ${filePath} (${content.length} bytes)`)
      }
    } catch (error) {
      console.error(` Error reading file ${filePath}:`, error)
    }
  }

  await getContents()

  console.log(` GitHub extraction complete: ${filesMap.size} files`)
  return filesMap
}

function shouldIncludeFile(path: string): boolean {
  const extensions = [
    "js",
    "jsx",
    "ts",
    "tsx",
    "java",
    "cs",
    "php",
    "py",
    "rb",
    "go",
    "sql",
    "html",
    "vue",
    "svelte",
    "dart",
    "kt",
    "swift",
  ]

  const ext = path.split(".").pop()?.toLowerCase()
  return ext ? extensions.includes(ext) : false
}

function shouldIgnoreDir(path: string): boolean {
  const ignored = [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "coverage",
    ".vscode",
    ".idea",
    "vendor",
    "target",
    "bin",
    "obj",
  ]

  return ignored.some((dir) => path.includes(dir))
}
