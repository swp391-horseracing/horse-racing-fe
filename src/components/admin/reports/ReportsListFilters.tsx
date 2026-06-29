import { Search } from "lucide-react";
import type { StatusFilter } from "./types";

interface ReportsListFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  onSearch: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function ReportsListFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onSearch,
  onKeyDown,
}: ReportsListFiltersProps) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Race, tournament, or referee name..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[160px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="referee_confirmed">Pending Publication</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Date From */}
        <div className="min-w-[150px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">
            From
          </label>
          <input
            type="date"
            lang="en-GB"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
          />
        </div>

        {/* Date To */}
        <div className="min-w-[150px]">
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">
            To
          </label>
          <input
            type="date"
            lang="en-GB"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          className="px-4 py-2 rounded-lg bg-[#064E3B] text-white text-xs font-bold hover:bg-[#043E2F] transition flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" /> Search
        </button>
      </div>
    </div>
  );
}
