import { useCallback, useEffect, useMemo, useState } from "react";
import { TournamentService } from "../services/TournamentService";

import type {
  RaceApiStatus,
  RaceItem,
  TournamentApiStatus,
  TournamentDetail,
  TournamentListItem,
} from "../types/tournament";

type FilterTab = "All" | TournamentApiStatus;
export type DetailTab = "schedule" | "entry" | "registration";

type RacePreview = {
  id: string;
  title: string;
  time: string;
  date: string;
  distance: string;
  surface: string;
  status: "Live" | "Upcoming" | "Completed" | string;
};

const DEFAULT_LIMIT = 10;

const mapRaceToPreview = (race: RaceItem): RacePreview => {
  const scheduled = new Date(race.scheduledAt);

  let status: RacePreview["status"];

  switch (race.status) {
    case "ongoing":
      status = "Live";
      break;

    case "completed":
    case "result_confirmed":
      status = "Completed";
      break;

    default:
      status = race.status;
      break;
  }

  return {
    id: race.id,
    title: race.name,
    time: scheduled.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    date: `${scheduled.getFullYear()}-${String(
      scheduled.getMonth() + 1
    ).padStart(2, "0")}-${String(scheduled.getDate()).padStart(2, "0")}`,
    distance: `${race.distanceMeters}m`,
    surface: race.trackCondition,
    status,
  };
};

export default function useTournament() {
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);

  const [allTournaments, setAllTournaments] = useState<TournamentListItem[]>(
    []
  );

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

  const loadAllTournaments = useCallback(async () => {
    try {
      const response = await TournamentService.getTournaments({
        page: 1,
        limit: 100,
      });

      setAllTournaments(response.data as unknown as TournamentListItem[]);
    } catch {
      setAllTournaments([]);
    }
  }, []);

  const loadTournaments = useCallback(async () => {
    try {
      setLoadingList(true);
      setListError(null);

      const response = await TournamentService.getTournaments({
        status: activeFilter === "All" ? undefined : activeFilter,
        page,
        limit,
      });

      setTournaments(response.data as unknown as TournamentListItem[]);
      setPagination(response.pagination);
    } catch (error) {
      setListError(
        error instanceof Error ? error.message : "Load tournaments failed"
      );

      setTournaments([]);
    } finally {
      setLoadingList(false);
    }
  }, [activeFilter, page, limit]);

  useEffect(() => {
    (async () => {
      await loadTournaments();
    })();
  }, [loadTournaments]);

  useEffect(() => {
    (async () => {
      await loadAllTournaments();
    })();
  }, [loadAllTournaments]);

  const loadTournamentDetail = useCallback(async () => {
    if (!selectedTournamentId) return;

    try {
      setRacesLoading(true);
      setRacesError(null);

      const [detail, racesResponse] = await Promise.all([
        TournamentService.getTournamentByID(selectedTournamentId),
        TournamentService.getTournamentRaces(selectedTournamentId, {
          status: raceStatus,
          page: 1,
          limit: DEFAULT_LIMIT,
        }),
      ]);

      setSelectedTournament(detail);
      setRaces(racesResponse.data);
      setRacesPagination(racesResponse.pagination);
    } catch (error) {
      setRacesError(
        error instanceof Error ? error.message : "Load detail failed"
      );

      setSelectedTournament(null);
      setRaces([]);
    } finally {
      setRacesLoading(false);
    }
  }, [selectedTournamentId, raceStatus]);

  useEffect(() => {
    (async () => {
      await loadTournamentDetail();
    })();
  }, [loadTournamentDetail]);

  const filteredTournaments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return tournaments;

    return tournaments.filter(
      (t) =>
        t.name.toLowerCase().includes(keyword) ||
        t.location.toLowerCase().includes(keyword)
    );
  }, [search, tournaments]);

  const counts = useMemo(
    () => ({
      All: allTournaments.length,
      Live: allTournaments.filter((t) => t.status === "ongoing").length,
      Scheduled: allTournaments.filter(
        (t) =>
          t.status === "upcoming" ||
          t.status === "registration_open" ||
          t.status === "registration_closed"
      ).length,
      Completed: allTournaments.filter((t) => t.status === "completed").length,
    }),
    [allTournaments]
  );

  const selectedRaces = useMemo(() => races.map(mapRaceToPreview), [races]);

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
    rawTournaments: allTournaments,

    pagination,
    counts,

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

    reloadTournaments: () => {
      void loadTournaments();
      void loadAllTournaments();
    },
  };
}
