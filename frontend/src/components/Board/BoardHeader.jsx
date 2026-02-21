export default function BoardHeader({ counts }) {
  const pendingCount = 0;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Workspace</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
          Manage your task in structured way
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Syncing…
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="glass noise px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-6">
          {[
            { key: 'todo', label: 'TODO', count: counts.todo },
            { key: 'inprogress', label: 'INPROGRESS', count: counts.inprogress },
            { key: 'done', label: 'DONE', count: counts.done },
          ].map(col => (
            <div key={col.key} className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-tighter text-muted-foreground/60 font-bold">
                {col.label}
              </span>
              <span className="text-sm font-display font-bold">{col.count}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
