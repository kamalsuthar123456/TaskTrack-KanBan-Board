export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="glass noise rounded-full h-16 w-16 flex items-center justify-center mb-4 border border-white/10">
        <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <p className="text-muted-foreground text-sm font-medium">Ready for tasks</p>
    </div>
  );
}
