export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
};

export const buildRoute = (path: string, id: string) =>
    path.replace(":id", id);