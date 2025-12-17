import type { ExtractedFile } from "./file-extractor"

export function detectLanguage(files: ExtractedFile[]): string {
  const extensionCount: Record<string, number> = {}

  // Count file extensions
  files.forEach((file) => {
    const ext = file.extension.toLowerCase()
    extensionCount[ext] = (extensionCount[ext] || 0) + 1
  })

  // Map extensions to languages
  const languageMap: Record<string, string> = {
    js: "JavaScript",
    jsx: "JavaScript/React",
    ts: "TypeScript",
    tsx: "TypeScript/React",
    java: "Java",
    cs: "C#",
    php: "PHP",
    py: "Python",
    rb: "Ruby",
    go: "Go",
    vue: "Vue.js",
    svelte: "Svelte",
    dart: "Dart",
    kt: "Kotlin",
    swift: "Swift",
  }

  // Find most common extension
  let maxCount = 0
  let primaryExtension = "unknown"

  Object.entries(extensionCount).forEach(([ext, count]) => {
    if (count > maxCount) {
      maxCount = count
      primaryExtension = ext
    }
  })

  return languageMap[primaryExtension] || "Unknown"
}
