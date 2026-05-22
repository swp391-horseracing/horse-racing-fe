export const ROUTES = {
    GUIDE_PAGE:"/",
    CALENDAR_PAGE: "/calendar",
    DASHBOARD_PAGE: "/dashboard",
    HORSE_PAGE: "/horse",
}

export const buildRoutes = (path: string, id: string) => {
    path.replace(":id", id)
}

