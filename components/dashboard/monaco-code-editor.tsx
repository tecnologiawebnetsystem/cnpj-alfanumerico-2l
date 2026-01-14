'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface MonacoCodeEditorProps {
  originalCode: string
  suggestedCode: string
  language: string
  onCodeChange: (newCode: string) => void
  readOnly?: boolean
}

export function MonacoCodeEditor({
  originalCode,
  suggestedCode,
  language,
  onCodeChange,
  readOnly = false
}: MonacoCodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true

    const initMonaco = async () => {
      try {
        const monaco = await import('monaco-editor')
        
        if (!mounted || !containerRef.current) return

        // Configure Monaco
        monaco.editor.defineTheme('cnpj-theme', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#1e1e1e',
            'editor.foreground': '#d4d4d4',
            'editorLineNumber.foreground': '#858585',
            'editor.selectionBackground': '#264f78',
            'editor.inactiveSelectionBackground': '#3a3d41',
          }
        })

        const languageMap: Record<string, string> = {
          'TypeScript': 'typescript',
          'JavaScript': 'javascript',
          'Python': 'python',
          'Java': 'java',
          'SQL': 'sql',
          'JSON': 'json',
          'HTML': 'html',
          'CSS': 'css',
          'Unknown': 'plaintext'
        }

        const monacoLanguage = languageMap[language] || 'plaintext'

        // Create diff editor
        const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
          theme: 'cnpj-theme',
          automaticLayout: true,
          readOnly: readOnly,
          renderSideBySide: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: 'on',
          renderWhitespace: 'boundary',
          diffWordWrap: 'on',
          originalEditable: false,
          renderOverviewRuler: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible'
          }
        })

        const originalModel = monaco.editor.createModel(originalCode, monacoLanguage)
        const modifiedModel = monaco.editor.createModel(suggestedCode, monacoLanguage)

        diffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        })

        // Listen for changes in modified editor
        modifiedModel.onDidChangeContent(() => {
          onCodeChange(modifiedModel.getValue())
        })

        editorRef.current = diffEditor

        setIsLoading(false)
      } catch (error) {
        console.error(' Failed to load Monaco Editor:', error)
        setIsLoading(false)
      }
    }

    initMonaco()

    return () => {
      mounted = false
      if (editorRef.current) {
        editorRef.current.dispose()
      }
    }
  }, [originalCode, suggestedCode, language, onCodeChange, readOnly])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando editor...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full min-h-[400px]" />
    </div>
  )
}
