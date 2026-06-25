import type { ToastType } from "../../types/referee";

export default function RegistryApprovals({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-xl font-black font-headline text-[#064E3B]">
          Verification & Registration Queue
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review plain-text profiles and tournament entry submissions
          (UC-AD-05).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Pending Alphanumeric Profiles
          </h3>
          <div className="space-y-3">
            <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    New Jockey Application
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Submitted 2 hours ago
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                  Pending
                </span>
              </div>

              <div className="text-[10px] bg-white p-2 rounded border border-slate-100 font-label text-slate-600">
                <p>Legal Name: Marcus Silva</p>
                <p>Club: Elite Riders Assoc.</p>
                <p>License ID: JCK-9941-XYZ</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    addToast("Profile Approved. Status Active.", "success")
                  }
                  className="flex-1 bg-[#064E3B] text-white text-xs font-bold py-1.5 rounded-lg shadow-sm hover:bg-[#043E2F]"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    addToast("Profile Rejected. Notification sent.", "error")
                  }
                  className="flex-1 bg-white border border-slate-200 text-rose-600 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Pending Tournament Entries
          </h3>
          <div className="space-y-3">
            <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Horse: Thunderbolt (TB)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Target: Elite Turf Season
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                  Pending
                </span>
              </div>

              <div className="text-[10px] bg-white p-2 rounded border border-slate-100 font-label text-slate-600">
                <p>Owner: John Doe</p>
                <p>Microchip ID: 199304000123</p>
                <p>
                  Eligibility Check:{" "}
                  <span className="text-emerald-600">Passed</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addToast("Horse Entry Approved.", "success")}
                  className="flex-1 bg-[#064E3B] text-white text-xs font-bold py-1.5 rounded-lg shadow-sm hover:bg-[#043E2F]"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    addToast("Entry Waitlisted due to capacity.", "warning")
                  }
                  className="flex-1 bg-white border border-slate-200 text-amber-600 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50"
                >
                  Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
