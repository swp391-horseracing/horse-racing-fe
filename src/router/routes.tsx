export const ROUTES = {
  // GENERAL
  HOME: "/landing",
  FEED: "/feed",
  LOGIN: "/login",
  REGISTER: "/register",
  CALENDAR: "/calendar",
  HORSES: "/horses",
  JOCKEYS: "/jockeys",
  RACES: "/races",
  TOURNAMENTS: "/tournaments",
  TOURNAMENT_DETAIL: "/tournaments/:id",
  LEADERBOARD: "/leaderboard",

  // USER
  USER_PROFILE: "/user/profile",
  USER_NOTIFICATION: "/user/notifications",

  // SPECTATOR
  SPECTATOR_DASHBOARD: "/spectator",
  SPECTATOR_BET: "/spectator/bet",
  SPECTATOR_TRACK_RESULT: "/spectator/track-result",

  // OWNER
  OWNER_DASHBOARD: "/owner",
  OWNER_HORSE_LIST: "/owner/horses",
  OWNER_JOCKEY_LIST: "/owner/jockeys",
  OWNER_REGISTER_HORSE: "/owner/tournament/register-horse",
  OWNER_EDIT_HORSE: "/owner/horse/edit/:id",
  OWNER_EDIT_HORSE_TOURNAMENT: "/owner/tournament/edit-horse/:id",
  OWNER_SELECT_JOCKEY: "/owner/tournament/select-jockey",
  OWNER_HORSE_MANAGEMENT: "/owner/horseManagement",
  OWNER_TOURNAMENT_REGISTER: "/owner/tournamentRegister",
  OWNER_SCHEDULE: "/owner/schedule",
  OWNER_ENTRIES: "/owner/entries",
  OWNER_ENTRY_SEND_INVITES: "/owner/entries/:entryId/send-invites",

  // JOCKEY
  JOCKEY_DASHBOARD: "/jockey",
  JOCKEY_SCHEDULE: "/jockey/schedule",
  JOCKEY_INVITATIONS: "/jockey/invitations",
  JOCKEY_HISTORY: "/jockey/history",

  // REFEREE
  REFEREE_DASHBOARD: "/referee",
  REFEREE_RACE_LIST: "/referee/races",
  REFEREE_TRACKS: "/referee/race/:id/monitor",
  REFEREE_REVIEW_REPORT: "/referee/review",

  // ADMIN
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USER_LIST: "/admin/users",
  ADMIN_USER_PROFILE: "/admin/users/:id",
  ADMIN_TOURNAMENT_LIST: "/admin/tournaments",
  ADMIN_TOURNAMENT_DETAIL: "/admin/tournaments/:id",
  ADMIN_TOURNAMENT_NEW: "/admin/tournaments/new",
  ADMIN_TOURNAMENT_EDIT: "/admin/tournaments/:id/edit",
  ADMIN_TOURNAMENT_RACE_NEW: "/admin/tournaments/:tournamentId/races/new",
  ADMIN_RACE_DETAIL: "/admin/races/:id",
  ADMIN_CALENDAR: "/admin/calendar",
  ADMIN_REPORTS: "/admin/reports",

  TRACKS: "/tracks",
  TRACK_DETAIL: "/tracks/:id",

  // DYNAMIC
  HORSE_DETAIL: "/horses/:id",
  JOCKEY_DETAIL: "/jockeys/:id",
  RACE_DETAIL: "/races/:id",
  RACE_PREDICT: "/races/:id/predictions",
  SPECTATOR_PREDICTIONS: "/spectator/predictions",
  RACE_LIVE: "/races/:id/live",

  //ERROR
  NOTHING_DETAIL: "/*",
};
