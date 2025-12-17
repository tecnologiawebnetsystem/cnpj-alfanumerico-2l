export class ZipProcessor {
  async extractFiles(file: File): Promise<Map<string, string>> {
    const JSZip = (await import("jszip")).default
    const zip = new JSZip()
    const contents = await zip.loadAsync(await file.arrayBuffer())
    const files = new Map<string, string>()

    const textExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".java",
      ".cs",
      ".php",
      ".py",
      ".rb",
      ".go",
      ".sql",
      ".xml",
      ".json",
      ".html",
      ".css",
      ".vue",
      ".dart",
      ".kt",
      ".swift",
      ".m",
      ".h",
      ".cpp",
      ".c",
    ]

    for (const [path, zipEntry] of Object.entries(contents.files)) {
      if (zipEntry.dir) continue

      const hasTextExtension = textExtensions.some((ext) => path.toLowerCase().endsWith(ext))
      if (!hasTextExtension) continue

      try {
        const content = await zipEntry.async("string")
        files.set(path, content)
      } catch (error) {
        console.error(`Error reading ${path}:`, error)
      }
    }

    return files
  }

  detectLanguage(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      jsx: "JavaScript React",
      ts: "TypeScript",
      tsx: "TypeScript React",
      java: "Java",
      cs: "C#",
      php: "PHP",
      py: "Python",
      rb: "Ruby",
      go: "Go",
      sql: "SQL",
      vue: "Vue.js",
      dart: "Dart",
      kt: "Kotlin",
      swift: "Swift",
    }
    return languageMap[ext || ""] || "Unknown"
  }
}
