import type { Horse } from "./horse.ts";
import type { Tournament } from "./tournament.ts";
import type { Jockey } from "./jockey.ts";

export interface Invitation {
  id: string;
  invitationId: string;
  raceId: string;
  ownerId: string;
  tournamentId?: string;
  status: "pending" | "accepted" | "declined" | "confirmed" | "superseded";
  invitedAt: string;
  respondedAt: string;
  additionalProp1?: Record<string, unknown>;
  horse: { id: string; name: string; breed: string };
  jockey: { id: string; fullName: string };
  tournament?: string;
  owner?: string;
  raceTime?: string;
}

export type SidebarTab = "inbox" | "sent" | "accepted" | "declined";

export interface MessageItem {
  id: string;
  regId: string;
  raceId: string;
  horseId: string;
  tournamentId: string;
  invitation?: Invitation;
}

export interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export type LookupHandlers = {
  getHorse: (id: string) => Horse | undefined;
  getTournament: (id: string) => Tournament | undefined;
  getJockey: (id: string) => Jockey | undefined;
};

export type ActionHandlers = {
  onInviteClick: (horseId: string, raceId: string) => void;
  onConfirm: (invitationId: string, raceId: string) => void;
  onCancel: (invitationId: string, raceId: string) => void;
};

export type TabProps = {
  messages: MessageItem[];
  search: string;
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
} & LookupHandlers &
  ActionHandlers;

export type DetailProps = {
  item: MessageItem | null;
} & LookupHandlers &
  ActionHandlers;
