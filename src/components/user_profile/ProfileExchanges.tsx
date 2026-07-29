import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Search } from "lucide-react";

export default function ProfileExchanges() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  // Remove hardcoded mock data, empty array as system doesn't have gift redemptions API
  const exchanges: any[] = [];

  const filteredExchanges = exchanges.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#064E3B] font-headline">
            My Gift Exchanges
          </h2>
          <p className="text-xs text-slate-500 font-body mt-1">
            Review the status of your items redeemed with your tokens.
          </p>
        </div>
        <button
          onClick={() => navigate("/spectator")}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 font-body border border-emerald-150 self-start md:self-auto"
        >
          <Gift className="w-3.5 h-3.5 text-[#EAB308]" />
          Visit Gift Shop
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-body"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-body cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table / Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest font-body">
              <th className="pb-3 pl-2">Order ID</th>
              <th className="pb-3">Item Details</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Redeemed Date</th>
              <th className="pb-3 text-right">Cost</th>
              <th className="pb-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredExchanges.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/30 transition-colors duration-150 font-body text-xs text-slate-700"
              >
                <td className="py-4 pl-2 font-mono font-bold text-slate-500">
                  #{item.id}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-500 shrink-0">
                      <Gift className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 text-slate-500">{item.category}</td>
                <td className="py-4 text-slate-500">{item.date}</td>
                <td className="py-4 text-right font-black text-rose-600 text-sm">
                  {item.cost} tokens
                </td>
                <td className="py-4 text-center">
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.status === "Processing"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredExchanges.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-slate-400 font-body"
                >
                  No exchanges found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
