import api from "../lib/api";
import type { WalletResponse } from "../types/wallet";

export const WalletService = {
  getMyWallet: async (): Promise<WalletResponse> => {
    const response = await api.get<WalletResponse>("/me/wallet");
    return response.data;
  },
};
