import lonely from "../assets/images/LonelyHorse.png";

export default function NoInfoPage() {
  return (
    <div className="h-full w-full text-[#1f3a34] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        <div className="relative mb-10 flex items-center justify-center">
          <div className="absolute -left-6 top-16 h-24 w-24 rounded-full bg-black/5 blur-2xl" />
          <div className="absolute -right-8 top-20 h-24 w-24 rounded-full bg-black/5 blur-2xl" />

          <div className="relative rounded-3xl bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-700 via-zinc-300 to-zinc-100">
              <div className="relative h-60 w-[230px]">
                <img
                  alt="Minimalist horse silhouette on track"
                  className="w-full h-full object-fill grayscale opacity-80"
                  src={lonely}
                />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -right-1 rounded-lg bg-white px-4 py-3 shadow-sm animate-bounce">
            <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.26em] text-[#5f5d34] uppercase ">
              <span className="h-3 w-3 rounded-full bg-[#8a7a2a]" />
              <span className="">No Active Sessions</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Quiet at the Starting Gates
        </h1>

        <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
          There are no items available at this time. The content list is being
          prepared and will appear once new data is published.
        </p>

        <div className="mt-12 text-xs font-medium tracking-[0.35em] text-slate-500 uppercase">
          Please check back later or adjust your filters to view more results.
        </div>
      </div>
    </div>
  );
}
