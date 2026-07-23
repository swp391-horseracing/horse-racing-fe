import { useEffect, useState, useCallback } from "react";
import { UserService } from "../services/UserService";

export function useWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await UserService.getWallet();
      setBalance(data.balance);
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    refetch();
  }, [refetch]);

  return { balance, loading, refetch };
}
