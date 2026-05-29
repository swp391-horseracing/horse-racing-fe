export const ROUTES = {
  GUIDE: "/",
  HOME: "/landing",
  LOGIN: "/login",
  REGISTER: "/register",
  CALENDAR: "/calendar",
  HORSE: "/horse",
  JOCKEY: "/jockey",
  RACES: "/races",
  SPECTATOR: "/spectator",
  OWNER: "/owner",
  ADMIN: "/admin",
  DASHBOARD: "/dashboard",
  USER: "/user",
  LEADERBOARD: "/leaderboard",
  REPORTS: "/reports",


};

export const buildRoute = (path: string, id: string) => {
  path.replace(":id", id);
}
