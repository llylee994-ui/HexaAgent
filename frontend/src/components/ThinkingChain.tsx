import { useChatStore } from '../stores/useChatStore'

export default function ThinkingChain() {
  const thinkingChain = useChatStore((s) => s.thinkingChain)

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xs tracking-wide text-soft px-4 py-3 border-b border-line">推理链</h3>
      <div className="flex-1 overflow-y-auto p-3">
        {thinkingChain.length === 0 ? (
          <p className="text-soft/50 text-xs text-center mt-8">发送问题后将在此展示推理过程</p>
        ) : (
          <div className="space-y-2">
            {thinkingChain.map((step, i) => (
              <div key={i} className="bg-warm border border-line/50 rounded-lg px-3 py-2 text-xs text-soft">
                <span className="text-matcha-dim mr-2 text-[10px]">{i + 1}.</span>{step}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
