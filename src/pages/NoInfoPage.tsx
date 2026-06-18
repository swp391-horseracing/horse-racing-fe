import lonely from "../assets/images/LonelyHorse.png";

export default function NoInfoPage() {
  return (
    <div className="h-full w-full text-[#1f3a34] flex items-center justify-center px-10 py-5">
      <div className="w-full flex flex-cow items-center">
        <div className="relative flex items-center justify-center">

          <div className="relative rounded-3xl bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-700 via-zinc-300 to-zinc-100">
              <div className="relative h-full w-[200px]">
                <img
                  alt="Minimalist horse silhouette on track"
                  className="w-full h-full object-fill grayscale opacity-80"
                  src={lonely}
                />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -right-1 rounded-lg bg-white px-4 py-3 shadow-sm animate-bounce">
            <div className="flex items-center gap-3 text-xs font-semibold text-[#5f5d34] uppercase ">
              <span className="h-3 w-3 rounded-full bg-[#8a7a2a]" />
              <span className="">No Active Sessions</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center px-10 ">

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Quiet at the Starting Gates
        </h1>

        <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
          There are no items available at this time. The content list is being
          prepared and will appear once new data is published.
        </p>

        <div className="mt-6 text-xs font-medium tracking-[0.35em] text-slate-500 uppercase">
          Please check back later or adjust your filters to view more results.
        </div>
        </div>
      </div>
    </div>
  );
}
