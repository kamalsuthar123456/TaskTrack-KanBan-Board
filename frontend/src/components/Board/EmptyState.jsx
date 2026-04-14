export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="h-16 w-16 rounded-full bg-white border border-[#E4E6EF] shadow-sm flex items-center justify-center mb-4">
        <svg className="h-8 w-8 text-[#B0B4C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <p className="text-[#8E92A4] text-sm font-medium">Ready for tasks</p>
    </div>
  );
}
