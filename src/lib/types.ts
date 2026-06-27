export type ActorType = "guest" | "user";

export type PlanCode = "free" | "premium";

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
  subscriptionStatus: SubscriptionStatus;
  freeDailyLimit: number;
  freeDailyUsed: number;
  freeDailyRemaining: number;
  nextCooldownSeconds: number;
};
