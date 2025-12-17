// Sistema de "fake database" usando localStorage para simular persistência
// Isso permite que mudanças feitas na UI sejam mantidas durante a sessão

type StorageKey = "notifications" | "tasks" | "comments" | "user_achievements" | "settings"

export const mockStorage = {
  get: <T>(key: StorageKey, defaultValue: T): T => {\
    if (typeof window === 'undefined') return defaultValue
    try {\
      const item = localStorage.getItem(`mock_${key}`)
      return item ? JSON.parse(item) : defaultValue
    } catch {\
      return defaultValue
    }
  },

  set: <T>(key: StorageKey, value: T): void => {\
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`mock_${key}`, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  },

  update: <T>(key: StorageKey, updater: (current: T) => T, defaultValue: T): T => {\
    const current = mockStorage.get(key, defaultValue)
    const updated = updater(current)
    mockStorage.set(key, updated)
    return updated
  },

  clear: (key?: StorageKey): void => {\
    if (typeof window === 'undefined') return
    if (key) {
      localStorage.removeItem(`mock_${key}`)
    } else {
      // Clear all mock data
      Object.keys(localStorage)
        .filter((k) => k.startsWith('mock_'))
        .forEach((k) => localStorage.removeItem(k))
    }
  },
}

// Helper para gerar IDs únicos
export const generateId = (): string => {\
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper para simular delay de rede
export const simulateNetworkDelay = (ms: number = 500): Promise<void> => {\
  return new Promise((resolve) => setTimeout(resolve, ms))\
}
