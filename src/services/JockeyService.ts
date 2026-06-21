import api from "../lib/api";
import type {
    TournamentApiStatus,
} from "../types/tournament";

export const JockeyService = {
    getJockeys: async (params?: {
        status?: TournamentApiStatus;
        page?: number;
        limit?: number;
    }): Promise<any> => {
        const response = await api.get("/jockeys", {
            params: {
                status: params?.status,
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
            },
        });

        console.log(response.data.data);

        return response.data;
    },
};
