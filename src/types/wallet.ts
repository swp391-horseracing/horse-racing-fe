export type TransactionType =
  | "genesis"
  | "prediction"
  | "reward"
  | "refund"
  | "admin_adjustment";

export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

export interface WalletResponse {
  walletId: string;
  balance: number;
  transactions: WalletTransaction[];
}
