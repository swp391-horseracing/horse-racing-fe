import { useEffect, useMemo, useState, useCallback } from "react";
import type {
  RaceApiStatus,
  RaceItem,
  TournamentApiStatus,
  TournamentDetail,
  TournamentListItem,
} from "../types/tournament";
import { TournamentService } from "../services/TournamentService.ts";

type FilterTab = "All" | TournamentApiStatus;
type DetailTab = "schedule" | "entry";

type RacePreview = {
  id: string;
  title: string;
  time: string;
  date: string; // Added full date
  distance: string;
  surface: string;
  status: "Live" | "Upcoming" | "Completed";
};

const DEFAULT_LIMIT = 10;

const mapRaceToPreview = (race: RaceItem): RacePreview => {
  const scheduled = new Date(race.scheduledAt);

  const time = scheduled.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format date as "YYYY-MM-DD" for consistency
  const yyyy = scheduled.getFullYear();
  const mm = String(scheduled.getMonth() + 1).padStart(2, "0");
  const dd = String(scheduled.getDate()).padStart(2, "0");
  const date = `${yyyy}-${mm}-${dd}`;

  return {
    id: race.id,
    title: race.name,
    time,
    date, // Added
    distance: `${race.distanceMeters}m`,
    surface: race.trackCondition,
    status:
      race.status === "ongoing"
        ? "Live"
        : race.status === "completed" || race.status === "result_confirmed"
          ? "Completed"
          : "Upcoming",
  };
};

export default function useTournament() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | null
  >(null);
  const [selectedTournament, setSelectedTournament] =
    useState<TournamentDetail | null>(null);

  const [races, setRaces] = useState<RaceItem[]>([]);
  const [racesPagination, setRacesPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });
  const [racesLoading, setRacesLoading] = useState(false);
  const [racesError, setRacesError] = useState<string | null>(null);

  const [raceStatus, setRaceStatus] = useState<RaceApiStatus | undefined>();
  const [detailTab, setDetailTab] = useState<DetailTab>("schedule");

  useEffect(() => {
    let mounted = true;

    const loadTournaments = async () => {
      setLoadingList(true);
      setListError(null);

      try {
        const res = await TournamentService.getTournaments({
          status: activeFilter === "All" ? undefined : activeFilter,
          page,
          limit,
        });
        console.log(res);

        if (!mounted) return;

        setTournaments(res.data);
        setPagination(res.pagination);
      } catch (error) {
        if (!mounted) return;

        setListError(error instanceof Error ? error.message : "Load failed");
        setTournaments([]);
        setPagination({
          page: 1,
          limit: DEFAULT_LIMIT,
          total: 0,
          totalPages: 0,
        });
      } finally {
        if (mounted) setLoadingList(false);
      }
    };

    loadTournaments();

    return () => {
      mounted = false;
    };
  }, [activeFilter, page, limit]);

  const resetRaceState = useCallback(() => {
    setSelectedTournament(null);
    setRaces([]);
    setRacesError(null);
    setRacesPagination({
      page: 1,
      limit: DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
    });
  }, []);

  useEffect(() => {
    if (!selectedTournamentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetRaceState();
      return;
    }

    let mounted = true;

    const loadDetail = async () => {
      setRacesLoading(true);
      setRacesError(null);

      try {
        const [detailRes, racesRes] = await Promise.all([
          TournamentService.getTournament(selectedTournamentId),
          TournamentService.getTournamentRaces(selectedTournamentId, {
            status: raceStatus,
            page: 1,
            limit: DEFAULT_LIMIT,
          }),
        ]);

        if (!mounted) return;

        setSelectedTournament(detailRes);
        setRaces(racesRes.data);
        setRacesPagination(racesRes.pagination);
      } catch (error) {
        if (!mounted) return;

        setRacesError(
          error instanceof Error ? error.message : "Load detail failed"
        );
        setSelectedTournament(null);
        setRaces([]);
        setRacesPagination({
          page: 1,
          limit: DEFAULT_LIMIT,
          total: 0,
          totalPages: 0,
        });
      } finally {
        if (mounted) setRacesLoading(false);
      }
    };

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [selectedTournamentId, raceStatus, resetRaceState]);

  const filteredTournaments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return tournaments;

    return tournaments.filter((tournament) => {
      return (
        tournament.name.toLowerCase().includes(keyword) ||
        tournament.location.toLowerCase().includes(keyword)
      );
    });
  }, [search, tournaments]);

  const counts = useMemo(
    () => ({
      All: tournaments.length,
      Live: tournaments.filter((t) => t.status === "ongoing").length,
      Scheduled: tournaments.filter(
        (t) =>
          t.status === "upcoming" ||
          t.status === "registration_open" ||
          t.status === "registration_closed"
      ).length,
      Completed: tournaments.filter((t) => t.status === "completed").length,
    }),
    [tournaments]
  );

  const selectedRaces = useMemo(() => {
    return races.map(mapRaceToPreview);
  }, [races]);

  const openTournament = (id: string) => {
    setSelectedTournamentId(id);
    setDetailTab("schedule");
    setRaceStatus(undefined);
  };

  const closeTournament = () => {
    setSelectedTournamentId(null);
    setSelectedTournament(null);
    setRaces([]);
    setRacesError(null);
    setRaceStatus(undefined);
    setRacesPagination({
      page: 1,
      limit: DEFAULT_LIMIT,
      total: 0,
      totalPages: 0,
    });
  };

  return {
    search,
    setSearch,

    activeFilter,
    setActiveFilter,

    page,
    setPage,
    limit,
    setLimit,

    tournaments: filteredTournaments,
    rawTournaments: tournaments,
    counts,
    pagination,
    loadingList,
    listError,

    selectedTournamentId,
    selectedTournament,
    openTournament,
    closeTournament,

    detailTab,
    setDetailTab,

    races: selectedRaces,
    raceStatus,
    setRaceStatus,
    racesPagination,
    racesLoading,
    racesError,
  };
}
