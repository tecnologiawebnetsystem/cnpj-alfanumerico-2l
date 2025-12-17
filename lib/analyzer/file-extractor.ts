import JSZip from "jszip"

export interface ExtractedFile {
  path: string
  content: string
  extension: string
  size: number
}

export async function extractFiles(file: File | null, githubUrl: string | null): Promise<ExtractedFile[]> {
  if (file) {
    return extractFromZip(file)
  } else if (githubUrl) {
    return extractFromGithub(githubUrl)
  }

  throw new Error("No file or GitHub URL provided")
}

async function extractFromZip(file: File): Promise<ExtractedFile[]> {
  const zip = new JSZip()
  const contents = await zip.loadAsync(await file.arrayBuffer())
  const files: ExtractedFile[] = []

  for (const [path, zipEntry] of Object.entries(contents.files)) {
    if (zipEntry.dir) continue

    // Skip common directories to ignore
    if (shouldIgnorePath(path)) continue

    // Only process text files
    if (!isTextFile(path)) continue

    try {
      const content = await zipEntry.async("string")
      const extension = path.split(".").pop() || ""

      files.push({
        path,
        content,
        extension,
        size: content.length,
      })
    } catch (error) {
      console.error(`[v0] Error reading file ${path}:`, error)
    }
  }

  return files
}

async function extractFromGithub(githubUrl: string): Promise<ExtractedFile[]> {
  // TODO: Implement GitHub repository cloning
  // For now, return empty array
  console.log("[v0] GitHub extraction not yet implemented:", githubUrl)
  return []
}

function shouldIgnorePath(path: string): boolean {
  const ignoredPatterns = [
    "node_modules/",
    ".git/",
    "dist/",
    "build/",
    ".next/",
    "coverage/",
    ".vscode/",
    ".idea/",
    "vendor/",
    "target/",
    "bin/",
    "obj/",
  ]

  return ignoredPatterns.some((pattern) => path.includes(pattern))
}

function isTextFile(path: string): boolean {
  const textExtensions = [
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

  const extension = path.split(".").pop()?.toLowerCase()
  return extension ? textExtensions.includes(extension) : false
}
