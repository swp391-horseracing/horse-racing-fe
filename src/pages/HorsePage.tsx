import { ChevronRight, X, Calendar, User, ChessKnight } from "lucide-react";
import useHorse from "../hooks/useHorse.ts";
import useAuth from "../hooks/useAuth.ts";
import { useEffect, useState } from "react";

export default function HorsePage() {
  const [ownerName, setOwnerName] = useState("loading... ");
  const {
    horses,
    loading,
    error,

    page,
    setPage,

    pagination,

    selectedHorse,
    detailLoading,

    openHorse,
    closeHorse,
  } = useHorse();
  const { getUserByID } = useAuth();

  useEffect(() => {
    if (!selectedHorse?.ownerId) return;

    getUserByID(selectedHorse.ownerId)
      .then((user) => {
        setOwnerName(user.full_name);
      })
      .catch(() => {
        setOwnerName("Unknown");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHorse?.ownerId]);

  const isPanelOpen = selectedHorse !== null;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-[1400px] mx-auto p-6">
        <h1 className="text-3xl font-black text-primary mb-6">
          Horse Management
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive p-4 text-destructive">
            {error}
          </div>
        )}

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
              horses.map((horse) => (
                <div
                  key={horse.id}
                  onClick={() => openHorse(horse.id)}
                  className="cursor-pointer rounded-2xl border bg-card p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ChessKnight className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-black text-primary">{horse.name}</h3>

                      <p className="text-sm text-muted-foreground">
                        {horse.breed}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2 pt-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="border rounded-lg px-3 py-1"
                >
                  Prev
                </button>

                <span>
                  {pagination.page} / {pagination.totalPages}
                </span>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border rounded-lg px-3 py-1"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {isPanelOpen && (
            <div className="lg:col-span-8">
              <div className="rounded-2xl border bg-card overflow-hidden">
                <div className="flex justify-between items-center border-b p-5">
                  <h2 className="text-2xl font-black text-primary">
                    Horse Detail
                  </h2>

                  <button onClick={closeHorse}>
                    <X />
                  </button>
                </div>

                {detailLoading ? (
                  <div className="p-6">Loading...</div>
                ) : (
                  selectedHorse && (
                    <div className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          {selectedHorse.imageUrl ? (
                            <img
                              src={selectedHorse.imageUrl}
                              alt={selectedHorse.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ChessKnight className="h-8 w-8 text-primary" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-3xl font-black truncate">
                            {selectedHorse.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {selectedHorse.breed}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <InfoCard
                          icon={<Calendar size={18} />}
                          label="Birth Date"
                          value={selectedHorse.birthDate}
                        />

                        <InfoCard
                          icon={<User size={18} />}
                          label="Weight"
                          value={`${selectedHorse.weightKg} kg`}
                        />

                        <InfoCard
                          icon={<ChessKnight size={18} />}
                          label="Health Status"
                          value={selectedHorse.healthStatus}
                        />

                        <InfoCard
                          icon={<User size={18} />}
                          label="Owner"
                          value={ownerName}
                        />

                        <InfoCard
                          icon={<User size={18} />}
                          label="Retired"
                          value={selectedHorse.isRetired ? "Yes" : "No"}
                        />

                        <InfoCard
                          icon={<Calendar size={18} />}
                          label="Created At"
                          value={new Date(
                            selectedHorse.createdAt
                          ).toLocaleDateString()}
                        />

                        <InfoCard
                          icon={<Calendar size={18} />}
                          label="Updated At"
                          value={new Date(
                            selectedHorse.updatedAt
                          ).toLocaleDateString()}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border rounded-xl p-4 bg-card">
      <div className="flex items-center gap-2 text-primary mb-2">
        {icon}
        <span className="text-xs uppercase font-bold">{label}</span>
      </div>

      <div className="font-semibold break-all">{value}</div>
    </div>
  );
}
