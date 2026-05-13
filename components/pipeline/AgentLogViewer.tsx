"use client"

import { useEffect, useRef } from "react"
import type { AgentLogEntry } from "@/types"

const levelColor: Record<AgentLogEntry["level"], string> = {
  info: "#60a5fa",
  warn: "var(--color-warning)",
  error: "var(--color-error)",
}

interface AgentLogViewerProps {
  logs: AgentLogEntry[]
  maxHeight?: number
}

export function AgentLogViewer({ logs, maxHeight = 240 }: AgentLogViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  if (logs.length === 0) {
    return (
      <div style={{ color: "var(--color-faint)", fontSize: 13, padding: "8px 0" }}>
        로그가 없습니다.
      </div>
    )
  }

  return (
    <div
      className="cn-scroll cn-mono"
      style={{
        maxHeight,
        overflowY: "auto",
        background: "#0a1020",
        border: "1px solid var(--color-border-soft)",
        borderRadius: "var(--radius-md)",
        padding: "12px 14px",
        fontSize: 12,
        lineHeight: 1.7,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {logs.map((entry, i) => (
        <div key={i} className="cn-fade-in" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: "var(--color-faint)", flexShrink: 0 }}>
            {new Date(entry.timestamp).toLocaleTimeString("ko-KR", { hour12: false })}
          </span>
          <span style={{ color: levelColor[entry.level], flexShrink: 0, fontWeight: 600, width: 36 }}>
            [{entry.level.toUpperCase().slice(0, 3)}]
          </span>
          <span style={{ color: "var(--color-text)" }}>{entry.message}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
