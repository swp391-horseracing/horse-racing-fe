import UserLayout from "../layouts/UserLayout"; // Adjust path as needed

export default function OwnerPage() {
  return (
    <UserLayout>
      <div className="p-6 space-y-4 max-w-7xl mx-auto font-body h-full overflow-y-auto">
        <div className="border-b border-[#064E3B]/10 pb-4">
          <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
            Owner Stable Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage your active registry stables, track medical files, and make
            Jockey placements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold font-headline text-[#064E3B] mb-2 text-md">
              Registered Horses
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Verify bio-metrics and stable tracking options under owner
              compliance procedures.
            </p>
          </div>
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold font-headline text-[#064E3B] mb-2 text-md">
              Ride Matches
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Review pending Jockey acceptance logs and configure system
              parameters.
            </p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
