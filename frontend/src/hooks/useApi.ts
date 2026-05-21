import type { HexagramData, ChatResponse } from '../types'

const BASE = '/api'

export async function paipanRequest(message: string): Promise<HexagramData> {
  const res = await fetch(`${BASE}/paipan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error(`Paipan error: ${res.status}`)
  return res.json()
}

export async function chatRequest(
  message: string,
  mode: 'auto' | 'manual' = 'auto',
  hexagramData?: HexagramData,
  sessionId?: string
): Promise<ChatResponse> {
  const body: Record<string, unknown> = { message, mode, session_id: sessionId || 'default' }
  if (hexagramData) body.hexagram_data = hexagramData

  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Chat error: ${res.status}`)
  return res.json()
}
