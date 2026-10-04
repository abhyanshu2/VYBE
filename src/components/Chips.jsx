export default function Chips({ items, value, onChange }) {
  return (
    <div className="no-scrollbar -mx-3 mb-4 flex gap-2 overflow-x-auto px-3 md:mx-0 md:px-0">
      {items.map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${value === t ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
          {t}
        </button>
      ))}
    </div>
  )
}
