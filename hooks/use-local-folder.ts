"use client"

import { useState, useCallback, useEffect } from "react"

interface LocalFolderState {
  handle: FileSystemDirectoryHandle | null
  path: string | null
  isSupported: boolean
  error: string | null
}

interface UseLocalFolderReturn {
  folderPath: string | null
  isSupported: boolean
  error: string | null
  isSelecting: boolean
  selectFolder: () => Promise<FileSystemDirectoryHandle | null>
  saveFile: (relativePath: string, content: string) => Promise<boolean>
  saveFiles: (files: { path: string; content: string }[], onProgress?: (current: number, total: number) => void) => Promise<{ success: number; failed: number }>
  clearFolder: () => void
}

// Check if File System Access API is supported
const isFileSystemAccessSupported = (): boolean => {
  if (typeof window === "undefined") return false
  return "showDirectoryPicker" in window
}

export function useLocalFolder(): UseLocalFolderReturn {
  const [state, setState] = useState<LocalFolderState>({
    handle: null,
    path: null,
    isSupported: false,
    error: null,
  })
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isSupported: isFileSystemAccessSupported(),
    }))
  }, [])

  // Select a folder using the directory picker
  const selectFolder = useCallback(async (): Promise<FileSystemDirectoryHandle | null> => {
    if (!isFileSystemAccessSupported()) {
      setState(prev => ({
        ...prev,
        error: "Seu navegador nao suporta selecao de pasta local. Use Chrome ou Edge.",
      }))
      return null
    }

    setIsSelecting(true)
    try {
      // @ts-ignore - showDirectoryPicker is not in TypeScript types yet
      const handle = await window.showDirectoryPicker({
        mode: "readwrite",
        startIn: "documents",
      })

      // Get the folder name (we can't get full path for security reasons)
      const folderName = handle.name

      setState({
        handle,
        path: folderName,
        isSupported: true,
        error: null,
      })

      // Store handle reference in IndexedDB for persistence
      try {
        await storeFolderHandle(handle)
      } catch (e) {
        console.warn("Could not persist folder handle:", e)
      }

      return handle
    } catch (error: any) {
      if (error.name === "AbortError") {
        // User cancelled - not an error
        setState(prev => ({ ...prev, error: null }))
      } else {
        setState(prev => ({
          ...prev,
          error: `Erro ao selecionar pasta: ${error.message}`,
        }))
      }
      return null
    } finally {
      setIsSelecting(false)
    }
  }, [])

  // Create directory recursively
  const createDirectoryRecursive = async (
    rootHandle: FileSystemDirectoryHandle,
    pathParts: string[]
  ): Promise<FileSystemDirectoryHandle> => {
    let currentHandle = rootHandle
    for (const part of pathParts) {
      if (part && part !== ".") {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create: true })
      }
    }
    return currentHandle
  }

  // Save a single file
  const saveFile = useCallback(
    async (relativePath: string, content: string): Promise<boolean> => {
      if (!state.handle) {
        setState(prev => ({ ...prev, error: "Nenhuma pasta selecionada" }))
        return false
      }

      try {
        // Verify permission
        // @ts-ignore
        const permission = await state.handle.queryPermission({ mode: "readwrite" })
        if (permission !== "granted") {
          // @ts-ignore
          const requested = await state.handle.requestPermission({ mode: "readwrite" })
          if (requested !== "granted") {
            setState(prev => ({ ...prev, error: "Permissao negada para escrever na pasta" }))
            return false
          }
        }

        // Parse path and create directories
        const pathParts = relativePath.split(/[/\\]/)
        const fileName = pathParts.pop() || "file.txt"
        
        let dirHandle = state.handle
        if (pathParts.length > 0) {
          dirHandle = await createDirectoryRecursive(state.handle, pathParts)
        }

        // Create and write file
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(content)
        await writable.close()

        return true
      } catch (error: any) {
        console.error("Error saving file:", relativePath, error)
        setState(prev => ({ ...prev, error: `Erro ao salvar ${relativePath}: ${error.message}` }))
        return false
      }
    },
    [state.handle]
  )

  // Save multiple files with progress
  const saveFiles = useCallback(
    async (
      files: { path: string; content: string }[],
      onProgress?: (current: number, total: number) => void
    ): Promise<{ success: number; failed: number }> => {
      let success = 0
      let failed = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const saved = await saveFile(file.path, file.content)
        if (saved) {
          success++
        } else {
          failed++
        }
        onProgress?.(i + 1, files.length)
      }

      return { success, failed }
    },
    [saveFile]
  )

  // Clear selected folder
  const clearFolder = useCallback(() => {
    setState({
      handle: null,
      path: null,
      isSupported: isFileSystemAccessSupported(),
      error: null,
    })
    clearStoredFolderHandle()
  }, [])

  return {
    folderPath: state.path,
    isSupported: state.isSupported,
    error: state.error,
    isSelecting,
    selectFolder,
    saveFile,
    saveFiles,
    clearFolder,
  }
}

// IndexedDB helpers for persisting folder handle
const DB_NAME = "cnpj-detector-storage"
const STORE_NAME = "folder-handles"

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

async function storeFolderHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(handle, "localFolder")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function clearStoredFolderHandle(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.delete("localFolder")
  } catch (e) {
    console.warn("Could not clear stored folder handle:", e)
  }
}
