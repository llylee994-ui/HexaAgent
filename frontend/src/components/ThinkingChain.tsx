import { useChatStore } from '../stores/useChatStore'

export default function ThinkingChain() {
  const thinkingChain = useChatStore((s) => s.thinkingChain)

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-400 px-4 py-3 border-b border-gray-800">
        🧠 推理链
      </h3>
      <div className="flex-1 overflow-y-auto p-3">
        {thinkingChain.length === 0 ? (
          <p className="text-gray-600 text-xs text-center mt-8">
            发送问题后将在此展示 Agent 的推理过程
          </p>
        ) : (
          <div className="space-y-2">
            {thinkingChain.map((step, i) => (
              <div
                key={i}
                className="bg-gray-900/60 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400"
              >
                <span className="text-gray-600 mr-2">#{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
