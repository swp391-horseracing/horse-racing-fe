export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
}

export const buildRoute = (path: string, id: string) =>
    path.replace(":id", id);