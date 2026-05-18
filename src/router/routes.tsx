export const ROUTES = {
    EXAMPLE: "/",
    HOME: "/home",
}

export const buildRoute = (path: string, id: string) =>
    path.replace(":id", id);