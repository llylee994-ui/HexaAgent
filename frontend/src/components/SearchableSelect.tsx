import { useState, useRef, useEffect } from 'react'

interface Props {
  options: string[]
  placeholder?: string
  onSelect: (value: string) => void
}

export default function SearchableSelect({ options, placeholder, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = options.filter((o) => o.includes(search))

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={search}
        placeholder={placeholder || '搜索卦名...'}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-600"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto bg-gray-800 border border-gray-700 rounded shadow-lg">
          {filtered.map((name) => (
            <button
              key={name}
              onClick={() => {
                onSelect(name)
                setSearch(name)
                setOpen(false)
              }}
              className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-amber-600/20 hover:text-amber-400 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
