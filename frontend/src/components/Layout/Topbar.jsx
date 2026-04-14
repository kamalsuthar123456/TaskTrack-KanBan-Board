import { Search, Share2, Upload } from "lucide-react";
import { memo } from "react";

const Topbar = memo(function Topbar({ project, onShare }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 px-6 py-4 bg-white border-b border-[#E4E6EF]">

      {/* Title */}
      <div className="flex items-center gap-2 md:gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1B1C22] tracking-tight">
          Kanban Dashboard
        </h1>
        <span className="text-xl md:text-2xl" role="img" aria-label="palette">🎨</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">

        {/* Search */}
        <button
          aria-label="Search tasks"
          className="p-2 md:p-2.5 text-[#8E92A4] hover:text-[#1B1C22] hover:bg-[#F4F5F7] rounded-full transition-colors flex-shrink-0"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Share */}
        <button
          onClick={onShare}
          className="hidden sm:flex items-center gap-2 bg-[#5243F0] hover:bg-[#4537D6] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full font-semibold transition-all text-sm flex-shrink-0 shadow-[0_4px_14px_rgba(82,67,240,0.35)] hover:shadow-[0_4px_20px_rgba(82,67,240,0.45)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        {/* Export */}
        <button
          aria-label="Export board"
          className="p-2 md:p-2.5 border border-[#E4E6EF] text-[#8E92A4] hover:text-[#1B1C22] hover:bg-[#F4F5F7] hover:border-[#C7C9DE] rounded-full transition-colors flex-shrink-0"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

export default Topbar;
