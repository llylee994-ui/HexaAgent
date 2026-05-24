import { useState } from 'react'

interface Props {
  onDone: () => void
}

export default function SetupPage({ onDone }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com/v1')
  const [model, setModel] = useState('deepseek-chat')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('请输入 API Key')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/config/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey.trim(), base_url: baseUrl.trim(), model: model.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        onDone()
      } else {
        setError('保存失败')
      }
    } catch {
      setError('网络错误，请检查后端是否启动')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">🔮</div>
          <h1 className="text-xl font-bold text-amber-400">HexaAgent 首次配置</h1>
          <p className="text-gray-500 text-xs mt-1">需要 DeepSeek API Key 才能使用 AI 断卦功能</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-gray-400 text-xs block mb-1">API Key *</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">API 地址</label>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">模型名称</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          {saving ? '保存中...' : '保存并开始使用'}
        </button>

        <p className="text-gray-600 text-[10px] text-center">
          Key 仅存储在本机，不会上传到任何地方<br />
          可在 <a href="https://platform.deepseek.com/api_keys" target="_blank" className="text-amber-500/70">platform.deepseek.com</a> 获取
        </p>
      </div>
    </div>
  )
}
