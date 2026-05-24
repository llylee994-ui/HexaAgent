import { useState, useRef, useEffect } from 'react'

export default function SearchableSelect({ options, placeholder, onSelect }: { options: string[]; placeholder?: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const filtered = options.filter(o => o.includes(search))

  useEffect(() => {
    const h = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={containerRef} className="relative flex-1">
      <input type="text" value={search} placeholder={placeholder || '搜索卦名...'} onFocus={() => setOpen(true)}
        onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
        className="w-full bg-cream border border-line rounded px-2 py-1.5 text-xs text-ink placeholder-soft focus:outline-none focus:border-matcha-dim" />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto bg-cream border border-line rounded shadow-lg">
          {filtered.map((name) => (
            <button key={name} onClick={() => { onSelect(name); setSearch(name); setOpen(false) }}
              className="w-full text-left px-2 py-1.5 text-xs text-ink hover:bg-matcha-dim/10 hover:text-matcha transition-colors">{name}</button>
          ))}
        </div>
      )}
    </div>
  )
}
