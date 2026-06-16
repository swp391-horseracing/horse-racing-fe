import { Star } from "lucide-react";
import useHorse from "../hooks/useHorse.ts";
import NoInfoPage from "./NoInfoPage.tsx";
import HorseSearch from "../components/horse/HorseSearch.tsx";
import { useNavigate } from "react-router-dom";

export default function HorsePage() {
  const { horses, loading, error, pagination, setPagination, selectedHorse } =
    useHorse();

  // const horseList = horses;
  const navigate = useNavigate();

  const isPanelOpen = selectedHorse !== null;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-[1600px] mx-auto m-6">
        <div className="bg-primary px-4 py-8 pt-5 my-6 rounded-sm">
          <h1 className="text-3xl font-black !text-[#F4F6F5]">Horse List</h1>
          <div className="flex max-w-4xl text-lg md:text-2xl leading-relaxed text-[#F4F6F5]">
            The Horse List page allows users to browse all available horses and
            view detailed information about each horse, including ownership,
            health status, weight, and important dates.
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive p-4 text-destructive">
            {error}
          </div>
        )}

        <h1 className="flex items-center justify-left text-xl font-black text-primary gap-2">
          <Star />
          <span className="text-2xl">Spotlight Horse</span>
        </h1>

        <div className="bg-background border-1 border-gray-400 px-4 py-10 my-6 rounded-sm">
          <div className="flex w-full justify-center items-center">
            <NoInfoPage />
          </div>
        </div>
        <div className="w-full mb-4">
          <HorseSearch
            value={pagination.search}
            onChange={(value) =>
              setPagination((prev) => ({
                ...prev,
                search: value,
                page: 1,
              }))
            }
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div
            className={`space-y-3 ${
              isPanelOpen ? "lg:col-span-4" : "lg:col-span-12"
            }`}
          >
            {loading ? (
              <div className="p-6 rounded-xl border bg-card">
                Loading horses...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {horses.map((horse) => (
                  <div
                    key={horse.id}
                    onClick={() => navigate(`/horses/${horse.id}`)}
                    className="group cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Image */}
                    <div className="relative h-80 overflow-hidden">
                      <img
                        src={horse.imageUrl}
                        alt={horse.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold text-[#173a35]">
                          {horse.name}
                        </h3>
                      </div>

                      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                        {horse.breed} • {horse.birthDate} yrs
                      </p>

                      <div className="mt-5 border-t pt-4">
                        <button className="flex w-full items-center justify-center gap-2 font-semibold text-[#173a35]">
                          View Profile
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12H9m0 0l3-3m-3 3l3 3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2 pt-3">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                  className="border rounded-lg px-3 py-1"
                >
                  Prev
                </button>

                <span>
                  {pagination.page} / {pagination.totalPages}
                </span>

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  className="border rounded-lg px-3 py-1"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
