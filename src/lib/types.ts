export type ActorType = "guest" | "user";

export type PlanCode = "guest" | "registered" | "premium";

export type MatchRole = "caller" | "callee";

export type SubscriptionStatus =
  | "none"
  | "approval_pending"
  | "trialing"
  | "active"
  | "cancelled"
  | "expired"
  | "suspended";

export type Actor = {
  type: ActorType;
  id: string;
  key: string;
  displayName: string;
};

export type MatchPayload = {
  id: string;
  channelName: string;
  role: MatchRole;
  peerActorType: ActorType;
  peerActorId: string;
  limitSeconds: number;
  nextCooldownSeconds: number;
  isPremium: boolean;
  planCode: PlanCode;
  dailyRemaining: number | null;
  startedAt: string;
};

export type MatchJoinResponse =
  | {
      status: "matched";
      match: MatchPayload;
    }
  | {
      status: "waiting";
      retryAfterMs: number;
      message: string;
    }
  | {
      status: "limit_reached" | "banned" | "configuration_error" | "error";
      message: string;
    };

export type ProfileStatus = {
  actor: Actor;
  isPremium: boolean;
  planCode: PlanCode;
  planLabel: string;
  subscriptionStatus: SubscriptionStatus;
  dailyMatchLimit: number | null;
  dailyMatchUsed: number;
  dailyMatchRemaining: number | null;
  callLimitSeconds: number;
  nextCooldownSeconds: number;
};
