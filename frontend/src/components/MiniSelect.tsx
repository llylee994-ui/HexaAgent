import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  options: string[]
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export default function MiniSelect({ value, options, onChange, className = '', placeholder, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] transition-colors border truncate
          ${open ? 'border-amber-500/50 bg-gray-700 text-amber-300' : 'border-gray-700/50 bg-gray-800/60 text-gray-300 hover:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {value || <span className="text-gray-600">{placeholder || '-'}</span>}
      </button>
      {open && (
        <div className="absolute z-20 mt-0.5 w-max min-w-full max-h-36 overflow-y-auto bg-gray-800 border border-gray-600 rounded shadow-lg">
          {placeholder && (
            <button
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-left px-2 py-1 text-[10px] text-gray-600 hover:bg-gray-700"
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full text-left px-2 py-1 text-[10px] transition-colors
                ${opt === value ? 'bg-amber-600/20 text-amber-400' : 'text-gray-300 hover:bg-gray-700 hover:text-amber-300'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
