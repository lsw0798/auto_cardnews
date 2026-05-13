"use client"

import { useEffect, useState } from "react"
import type { ApiKeys } from "@/types"

const STORAGE_KEY = "cardnews_api_keys"

const DEFAULT_KEYS: ApiKeys = {
  openaiKey: "",
  serperKey: "",
  unsplashKey: "",
  llmBaseUrl: "",
  llmModel: "gpt-4o",
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(DEFAULT_KEYS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ApiKeys>
        setApiKeys({ ...DEFAULT_KEYS, ...parsed })
      }
    } catch {
      // Ignore parse errors and fall back to defaults
    } finally {
      setLoaded(true)
    }
  }, [])

  function saveApiKeys(keys: ApiKeys) {
    setApiKeys(keys)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
    }
  }

  function clearApiKeys() {
    setApiKeys(DEFAULT_KEYS)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  function hasRequiredKeys(): boolean {
    return Boolean(apiKeys.openaiKey && apiKeys.serperKey && apiKeys.unsplashKey)
  }

  function getEncodedKeys(): string {
    if (typeof window === "undefined") return ""
    return window.btoa(unescape(encodeURIComponent(JSON.stringify(apiKeys))))
  }

  return { apiKeys, loaded, saveApiKeys, clearApiKeys, hasRequiredKeys, getEncodedKeys }
}
