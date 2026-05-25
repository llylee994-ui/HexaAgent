import { useState } from 'react'

const MODEL_OPTIONS = [
  { value: 'deepseek-chat', label: 'DeepSeek V4 Flash (快)' },
  { value: 'deepseek-reasoner', label: 'DeepSeek V4 思考 (深)' },
]

export default function SetupPage({ onDone }: { onDone: () => void }) {
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com/v1')
  const [model, setModel] = useState('deepseek-chat')
  const [thinking, setThinking] = useState(false)
  const [effort, setEffort] = useState('medium')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!apiKey.trim()) { setError('请输入 API Key'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/config/setup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey.trim(), base_url: baseUrl.trim(), model: model.trim(), thinking_mode: thinking, reasoning_effort: effort }),
      })
      if ((await res.json()).success) onDone(); else setError('保存失败')
    } catch { setError('网络错误') }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-warm border border-line rounded p-6 space-y-4">
        <div className="text-center">
          <p className="text-2xl tracking-widest text-matcha mb-1">HexaAgent</p>
          <p className="text-soft text-xs">六爻解卦智能体 &middot; 首次配置</p>
        </div>

        <div className="space-y-3">
          <div><label className="text-soft text-xs block mb-1">API Key</label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-xxxxxxxxxxxxxxxx"
              className="w-full bg-cream border border-line rounded px-3 py-2 text-sm text-ink placeholder-soft focus:outline-none focus:border-matcha-dim" /></div>

          <div><label className="text-soft text-xs block mb-1">模型</label>
            <select value={model} onChange={(e) => setModel(e.target.value)}
              className="w-full bg-cream border border-line rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-matcha-dim">
              {MODEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select></div>

          <div className="flex items-center justify-between">
            <span className="text-soft text-xs">深度思考模式</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={thinking} onChange={(e) => setThinking(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-line rounded-full peer peer-checked:bg-matcha after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-cream after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
            </label>
          </div>

          {thinking && (
            <div><label className="text-soft text-xs block mb-1">推理深度: {effort === 'low' ? '浅' : effort === 'medium' ? '中' : '深'}</label>
              <select value={effort} onChange={(e) => setEffort(e.target.value)}
                className="w-full bg-cream border border-line rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-matcha-dim">
                <option value="low">浅 (low) - 快速</option>
                <option value="medium">中 (medium) - 均衡</option>
                <option value="high">深 (high) - 详尽</option>
              </select></div>
          )}

          <div><label className="text-soft text-xs block mb-1">API 地址</label>
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-cream border border-line rounded px-3 py-2 text-sm text-ink focus:outline-none focus:border-matcha-dim" /></div>
        </div>

        {error && <p className="text-rust text-xs text-center">{error}</p>}

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-matcha hover:bg-matcha-dim disabled:bg-line text-ink rounded py-2.5 text-sm font-medium transition-colors">
          {saving ? '保存中...' : '保存并开始使用'}
        </button>

        <p className="text-soft text-[10px] text-center">Key 仅存储在本机。deepseek-chat/reasoner 将于 2026-07-24 停用</p>
      </div>
    </div>
  )
}
