"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeAlert,
  CircleStop,
  Loader2,
  Mic,
  RefreshCw,
  Video,
} from "lucide-react";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import {
  getAnalyticsContext,
  trackEvent,
  type AnalyticsParams,
} from "@/lib/analytics";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MatchJoinResponse, MatchPayload } from "@/lib/types";

type VideoChatProps = {
  isPremium: boolean;
  isAuthenticated: boolean;
  onProfileRefresh: () => void;
};

type SignalMessage =
  | {
      sender: string;
      kind: "offer" | "answer";
      description: RTCSessionDescriptionInit;
    }
  | {
      sender: string;
      kind: "candidate";
      candidate: RTCIceCandidateInit;
    }
  | {
      sender: string;
      kind: "control";
      control: "leave";
    };

type OutgoingSignalMessage =
  | {
      kind: "offer" | "answer";
      description: RTCSessionDescriptionInit;
    }
  | {
      kind: "candidate";
      candidate: RTCIceCandidateInit;
    }
  | {
      kind: "control";
      control: "leave";
    };

type SignalPollResponse = {
  ok: boolean;
  message?: string;
  signals?: Array<{
    id: number;
    message: SignalMessage;
  }>;
};

const languages = [
  { value: "any", label: "Qualsiasi lingua" },
  { value: "it", label: "Italiano" },
  { value: "en", label: "Inglese" },
  { value: "es", label: "Spagnolo" },
  { value: "fr", label: "Francese" },
  { value: "de", label: "Tedesco" },
];

const countries = [
  { value: "any", label: "Qualsiasi Paese" },
  { value: "IT", label: "Italia" },
  { value: "FR", label: "Francia" },
  { value: "DE", label: "Germania" },
  { value: "ES", label: "Spagna" },
  { value: "US", label: "Stati Uniti" },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

async function getIceServers() {
  const response = await fetch("/api/ice");
  const data = (await response.json()) as { iceServers?: RTCIceServer[] };
  return data.iceServers?.length
    ? data.iceServers
    : [{ urls: "stun:stun.cloudflare.com:3478" }];
}

const localMediaConstraints: MediaStreamConstraints = {
  video: {
    width: { ideal: 960 },
    height: { ideal: 540 },
    facingMode: "user",
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

function getMediaContext() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      isEmbedded: false,
      isInAppBrowser: false,
      isSecureContext: true,
    };
  }

  let isEmbedded = false;

  try {
    isEmbedded = window.self !== window.top;
  } catch {
    isEmbedded = true;
  }

  const userAgent = navigator.userAgent ?? "";
  const isInAppBrowser =
    /FBAN|FBAV|Instagram|Line\/|LinkedInApp|TikTok|Twitter|Snapchat|Pinterest|\bwv\b/i.test(
      userAgent,
    );

  return {
    isEmbedded,
    isInAppBrowser,
    isSecureContext: window.isSecureContext,
  };
}

function getMediaErrorName(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string" &&
    error.name
  ) {
    return error.name;
  }

  return "unknown";
}

function getMediaAccessMessage(error: unknown) {
  const errorName = getMediaErrorName(error);
  const context = getMediaContext();

  if (!context.isSecureContext) {
    return "Camera e microfono funzionano solo su HTTPS. Apri https://devroulotte.chat/chat e riprova.";
  }

  if (context.isEmbedded) {
    return "Il browser sta aprendo DevRoulotte dentro un frame. Apri la pagina in una scheda completa di Safari o Chrome e riprova.";
  }

  if (context.isInAppBrowser) {
    return "Il browser interno dell'app potrebbe bloccare camera e microfono. Apri devroulotte.chat in Safari o Chrome, poi consenti Camera e Microfono.";
  }

  if (
    errorName === "NotAllowedError" ||
    errorName === "PermissionDeniedError" ||
    errorName === "SecurityError"
  ) {
    return "Permesso camera/microfono negato o bloccato. Su mobile apri le impostazioni del sito in Safari/Chrome e consenti Camera e Microfono per devroulotte.chat.";
  }

  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return "Non trovo una camera o un microfono disponibili su questo dispositivo.";
  }

  if (errorName === "NotReadableError" || errorName === "TrackStartError") {
    return "Camera o microfono sembrano gia' usati da un'altra app. Chiudi le altre app e riprova.";
  }

  if (errorName === "OverconstrainedError" || errorName === "ConstraintNotSatisfiedError") {
    return "Il browser non riesce ad aprire la camera con queste impostazioni. Riprova dopo aver chiuso altre app video.";
  }

  if (errorName === "not_supported") {
    return "Questo browser non permette a DevRoulotte di usare camera e microfono. Apri il sito in Safari o Chrome aggiornato.";
  }

  return "Non riesco ad accedere a camera e microfono. Controlla i permessi del browser e riprova da Safari o Chrome.";
}

function createMediaAccessError(name: string, originalError?: unknown) {
  const error = new Error(getMediaAccessMessage(originalError ?? { name }));
  error.name = name;
  return error;
}

export function VideoChat({
  isPremium,
  isAuthenticated,
  onProfileRefresh,
}: VideoChatProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const matchRef = useRef<MatchPayload | null>(null);
  const searchingRef = useRef(false);
  const matchSearchTokenRef = useRef(0);
  const isPollingForMatchRef = useRef(false);
  const clientIdRef = useRef("");
  const offerRetryTimersRef = useRef<number[]>([]);
  const connectionWatchdogTimersRef = useRef<number[]>([]);
  const autoNextTimerRef = useRef<number | null>(null);
  const connectionTokenRef = useRef(0);
  const signalPollingTokenRef = useRef(0);
  const lastSignalIdRef = useRef(0);
  const connectedMatchIdsRef = useRef<Set<string>>(new Set());
  const connectedAtRef = useRef<number | null>(null);

  const [ageConfirmed, setAgeConfirmed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("devroulotte_age_18") === "yes",
  );
  const [rulesAccepted, setRulesAccepted] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("devroulotte_rules_ok") === "yes",
  );
  const [status, setStatus] = useState<
    "idle" | "permissions" | "waiting" | "connecting" | "connected" | "failed"
  >("idle");
  const [message, setMessage] = useState("Pronto quando vuoi.");
  const [match, setMatch] = useState<MatchPayload | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState("any");
  const [preferredCountry, setPreferredCountry] = useState("any");
  const [reportReason, setReportReason] = useState("nudity");
  const [nextLockedUntil, setNextLockedUntil] = useState(0);
  const [nextLockedSeconds, setNextLockedSeconds] = useState(0);
  const analyticsContext = useMemo(
    () => getAnalyticsContext(isAuthenticated, isPremium),
    [isAuthenticated, isPremium],
  );
  const trackChatEvent = useCallback(
    (eventName: string, params: AnalyticsParams = {}) => {
      trackEvent(eventName, {
        ...analyticsContext,
        surface: "chat",
        ...params,
      });
    },
    [analyticsContext],
  );

  useEffect(() => {
    clientIdRef.current = getOrCreateGuestId();
  }, []);

  useEffect(() => {
    if (ageConfirmed) {
      window.localStorage.setItem("devroulotte_age_18", "yes");
    }

    if (rulesAccepted) {
      window.localStorage.setItem("devroulotte_rules_ok", "yes");
    }
  }, [ageConfirmed, rulesAccepted]);

  useEffect(() => {
    if (!nextLockedUntil) {
      return;
    }

    const interval = window.setInterval(() => {
      setNextLockedSeconds(
        Math.max(Math.ceil((nextLockedUntil - Date.now()) / 1000), 0),
      );
    }, 250);

    return () => window.clearInterval(interval);
  }, [nextLockedUntil]);

  const clearOfferRetries = useCallback(() => {
    offerRetryTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    offerRetryTimersRef.current = [];
  }, []);

  const clearConnectionWatchdogs = useCallback(() => {
    connectionWatchdogTimersRef.current.forEach((timer) =>
      window.clearTimeout(timer),
    );
    connectionWatchdogTimersRef.current = [];
  }, []);

  const clearAutoNext = useCallback(() => {
    if (autoNextTimerRef.current) {
      window.clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
  }, []);

  const stopSignalPolling = useCallback(() => {
    signalPollingTokenRef.current += 1;
  }, []);

  function isCurrentConnection(
    token: number,
    pc: RTCPeerConnection,
    matchId: string,
  ) {
    return (
      connectionTokenRef.current === token &&
      peerConnectionRef.current === pc &&
      matchRef.current?.id === matchId &&
      pc.connectionState !== "closed"
    );
  }

  function scheduleAutoNext(messageText: string, reason: string) {
    if (!searchingRef.current || autoNextTimerRef.current) {
      return;
    }

    trackChatEvent("auto_next_scheduled", {
      call_state: connectedAtRef.current ? "connected" : "connecting",
      failure_reason: reason,
    });
    setStatus("waiting");
    setMessage(`${messageText} Cerco automaticamente un nuovo match.`);

    autoNextTimerRef.current = window.setTimeout(() => {
      autoNextTimerRef.current = null;

      if (!searchingRef.current) {
        return;
      }

      void goToNext({ reason });
    }, 1400);
  }

  const logWebRtcEvent = useCallback(
    (
      event: string,
      details: Record<string, string | null | undefined> = {},
      targetMatch?: MatchPayload | null,
    ) => {
      const currentMatch = targetMatch ?? matchRef.current;

      if (!currentMatch) {
        return;
      }

      void (async () => {
        const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
        await fetch("/api/webrtc/log", {
          method: "POST",
          headers,
          body: JSON.stringify({
            matchId: currentMatch.id,
            role: currentMatch.role,
            event,
            ...details,
          }),
        }).catch(() => null);
      })();
    },
    [supabase],
  );

  const sendSignalForMatch = useCallback(
    async (targetMatch: MatchPayload, message: OutgoingSignalMessage) => {
      const senderClientId = clientIdRef.current || getOrCreateGuestId();
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/webrtc/signal/send", {
        method: "POST",
        headers,
        body: JSON.stringify({
          matchId: targetMatch.id,
          senderClientId,
          message: {
            ...message,
            sender: senderClientId,
          },
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message ?? "Invio signaling fallito");
      }
    },
    [supabase],
  );

  const markMatchConnected = useCallback(
    async (targetMatch: MatchPayload) => {
      if (connectedMatchIdsRef.current.has(targetMatch.id)) {
        return;
      }

      connectedMatchIdsRef.current.add(targetMatch.id);
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/matchmaking/connected", {
        method: "POST",
        headers,
        body: JSON.stringify({ matchId: targetMatch.id }),
      });

      if (!response.ok) {
        connectedMatchIdsRef.current.delete(targetMatch.id);
        return;
      }

      onProfileRefresh();
    },
    [onProfileRefresh, supabase],
  );

  const cleanupConnection = useCallback(async (keepCamera: boolean, reason = "left") => {
    const currentMatch = matchRef.current;
    const currentPeerConnection = peerConnectionRef.current;
    const callConnectedAt = connectedAtRef.current;

    if (currentMatch && callConnectedAt) {
      trackChatEvent("video_call_ended", {
        call_duration_sec: Math.max(
          Math.floor((Date.now() - callConnectedAt) / 1000),
          0,
        ),
        end_reason: reason,
        role: currentMatch.role,
      });
    }

    clearAutoNext();
    clearOfferRetries();
    clearConnectionWatchdogs();
    stopSignalPolling();
    connectionTokenRef.current += 1;

    if (currentMatch) {
      await sendSignalForMatch(currentMatch, {
        kind: "control",
        control: "leave",
      }).catch(() => null);
    }

    currentPeerConnection?.close();
    peerConnectionRef.current = null;

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (!keepCamera) {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }

    if (currentMatch) {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      await fetch("/api/matchmaking/leave", {
        method: "POST",
        headers,
        body: JSON.stringify({ matchId: currentMatch.id, reason }),
      }).catch(() => null);
    }

    matchRef.current = null;
    connectedAtRef.current = null;
    setMatch(null);
    setConnectedAt(null);
    setElapsed(0);
  }, [
    clearAutoNext,
    clearConnectionWatchdogs,
    clearOfferRetries,
    sendSignalForMatch,
    stopSignalPolling,
    supabase,
    trackChatEvent,
  ]);

  useEffect(() => {
    return () => {
      searchingRef.current = false;
      void cleanupConnection(false);
    };
  }, [cleanupConnection]);

  useEffect(() => {
    if (!match || connectedAt === null) {
      return;
    }

    const activeMatch = match;
    const callConnectedAt = connectedAt;

    function tick() {
      const nextElapsed = Math.floor((Date.now() - callConnectedAt) / 1000);
      setElapsed(nextElapsed);

      if (nextElapsed >= activeMatch.limitSeconds) {
        setMessage("Limite chiamata raggiunto.");
        searchingRef.current = false;
        void cleanupConnection(false).then(() => {
          setStatus("idle");
          onProfileRefresh();
        });
      }
    }

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [cleanupConnection, connectedAt, match, onProfileRefresh]);

  async function ensureMedia() {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const mediaContext = getMediaContext();

    setStatus("permissions");
    setMessage("Richiedo webcam e microfono.");
    trackChatEvent("media_permission_requested", {
      embedded_context: mediaContext.isEmbedded,
      in_app_browser: mediaContext.isInAppBrowser,
      secure_context: mediaContext.isSecureContext,
    });

    if (!navigator.mediaDevices?.getUserMedia) {
      trackChatEvent("media_permission_failed", {
        embedded_context: mediaContext.isEmbedded,
        failure_reason: "not_supported",
        in_app_browser: mediaContext.isInAppBrowser,
        secure_context: mediaContext.isSecureContext,
      });
      throw createMediaAccessError("not_supported");
    }

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia(localMediaConstraints);
      trackChatEvent("media_permission_granted");
    } catch (error) {
      const failureReason = getMediaErrorName(error);

      trackChatEvent("media_permission_failed", {
        embedded_context: mediaContext.isEmbedded,
        failure_reason: failureReason,
        in_app_browser: mediaContext.isInAppBrowser,
        secure_context: mediaContext.isSecureContext,
      });
      throw createMediaAccessError(failureReason, error);
    }

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      await localVideoRef.current.play().catch(() => null);
    }

    return stream;
  }

  async function handleSignal(
    message: SignalMessage,
    pc: RTCPeerConnection,
    token: number,
    currentMatch: MatchPayload,
    sendScopedSignal: (message: OutgoingSignalMessage) => Promise<void>,
  ) {
    if (message.sender === clientIdRef.current) {
      return;
    }

    if (!isCurrentConnection(token, pc, currentMatch.id)) {
      return;
    }

    try {
      if (message.kind === "control" && message.control === "leave") {
        scheduleAutoNext("L'altra persona ha lasciato la chiamata.", "peer_left");
        return;
      }

      if (message.kind === "offer") {
        logWebRtcEvent("offer_received", {
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          signalingState: pc.signalingState,
        }, currentMatch);
        await pc.setRemoteDescription(message.description);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendScopedSignal({ kind: "answer", description: answer });
        logWebRtcEvent("answer_sent", {
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          signalingState: pc.signalingState,
        }, currentMatch);
      }

      if (
        message.kind === "answer" &&
        pc.signalingState === "have-local-offer"
      ) {
        logWebRtcEvent("answer_received", {
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          signalingState: pc.signalingState,
        }, currentMatch);
        await pc.setRemoteDescription(message.description);
        clearOfferRetries();
      }

      if (message.kind === "candidate") {
        await pc.addIceCandidate(message.candidate).catch(() => null);
      }
    } catch {
      logWebRtcEvent("signal_error", {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      }, currentMatch);
      scheduleAutoNext("Signaling WebRTC non riuscito.", "signal_error");
    }
  }

  async function pollSignals(
    pc: RTCPeerConnection,
    token: number,
    currentMatch: MatchPayload,
    sendScopedSignal: (message: OutgoingSignalMessage) => Promise<void>,
  ) {
    let failures = 0;

    while (
      signalPollingTokenRef.current === token &&
      isCurrentConnection(token, pc, currentMatch.id)
    ) {
      try {
        const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
        const response = await fetch("/api/webrtc/signal/poll", {
          method: "POST",
          headers,
          body: JSON.stringify({
            matchId: currentMatch.id,
            receiverClientId: clientIdRef.current,
            afterId: lastSignalIdRef.current,
          }),
        });

        const data = (await response.json()) as SignalPollResponse;

        if (!response.ok || !data.ok) {
          throw new Error(data.message ?? "Polling signaling fallito");
        }

        failures = 0;

        for (const signal of data.signals ?? []) {
          lastSignalIdRef.current = Math.max(
            lastSignalIdRef.current,
            signal.id,
          );
          await handleSignal(
            signal.message,
            pc,
            token,
            currentMatch,
            sendScopedSignal,
          );
        }
      } catch (error) {
        failures += 1;
        logWebRtcEvent("signal_poll_error", {
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          signalingState: pc.signalingState,
          detail: error instanceof Error ? error.message : "poll_error",
        }, currentMatch);

        if (failures >= 4) {
          scheduleAutoNext("Signaling non disponibile.", "signal_poll_failed");
          return;
        }
      }

      await new Promise((resolve) => window.setTimeout(resolve, 650));
    }
  }

  async function connectToMatch(nextMatch: MatchPayload) {
    const connectStartedAt = Date.now();
    const stream = await ensureMedia();
    const iceServers = await getIceServers();
    const pc = new RTCPeerConnection({ iceServers });
    const remoteStream = new MediaStream();
    const connectionToken = connectionTokenRef.current + 1;

    connectionTokenRef.current = connectionToken;
    lastSignalIdRef.current = 0;
    connectedAtRef.current = null;
    peerConnectionRef.current = pc;
    matchRef.current = nextMatch;
    setMatch(nextMatch);
    setConnectedAt(null);
    setElapsed(0);
    setStatus("connecting");
    setMessage("Connessione peer-to-peer in corso.");
    trackChatEvent("webrtc_connect_started", {
      call_limit_sec: nextMatch.limitSeconds,
      role: nextMatch.role,
    });
    logWebRtcEvent("connect_start", {
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      signalingState: pc.signalingState,
    }, nextMatch);

    async function sendScopedSignal(message: OutgoingSignalMessage) {
      if (!isCurrentConnection(connectionToken, pc, nextMatch.id)) {
        return;
      }

      await sendSignalForMatch(nextMatch, message);
    }

    for (const track of stream.getTracks()) {
      pc.addTrack(track, stream);
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      void remoteVideoRef.current.play().catch(() => null);
    }

    pc.ontrack = (event) => {
      if (!isCurrentConnection(connectionToken, pc, nextMatch.id)) {
        return;
      }

      event.streams[0]?.getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      void remoteVideoRef.current?.play().catch(() => null);
      logWebRtcEvent("remote_track", {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      }, nextMatch);
    };

    pc.onicecandidate = (event) => {
      if (
        event.candidate &&
        isCurrentConnection(connectionToken, pc, nextMatch.id)
      ) {
        void sendScopedSignal({
          kind: "candidate",
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (!isCurrentConnection(connectionToken, pc, nextMatch.id)) {
        return;
      }

      logWebRtcEvent("connection_state", {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      }, nextMatch);

      if (pc.connectionState === "connected") {
        clearOfferRetries();
        clearConnectionWatchdogs();
        clearAutoNext();
        if (!connectedAtRef.current) {
          const now = Date.now();
          connectedAtRef.current = now;
          setConnectedAt(now);
          setElapsed(0);
          trackChatEvent("video_call_connected", {
            call_limit_sec: nextMatch.limitSeconds,
            connection_time_ms: now - connectStartedAt,
            role: nextMatch.role,
          });
        }
        setStatus("connected");
        setMessage("Connesso.");
        void markMatchConnected(nextMatch);
      }

      if (pc.connectionState === "failed") {
        scheduleAutoNext("Connessione WebRTC fallita.", "webrtc_failed");
      }

      if (pc.connectionState === "disconnected") {
        scheduleAutoNext("Connessione interrotta.", "webrtc_disconnected");
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (!isCurrentConnection(connectionToken, pc, nextMatch.id)) {
        return;
      }

      logWebRtcEvent("ice_connection_state", {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      }, nextMatch);
    };

    pc.onicegatheringstatechange = () => {
      if (!isCurrentConnection(connectionToken, pc, nextMatch.id)) {
        return;
      }

      logWebRtcEvent("ice_gathering_state", {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceGatheringState: pc.iceGatheringState,
        signalingState: pc.signalingState,
      }, nextMatch);
    };

    pc.onsignalingstatechange = () => {
      if (!isCurrentConnection(connectionToken, pc, nextMatch.id)) {
        return;
      }

      logWebRtcEvent("signaling_state", {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      }, nextMatch);
    };

    async function sendOffer(iceRestart = false) {
      if (
        nextMatch.role !== "caller" ||
        !isCurrentConnection(connectionToken, pc, nextMatch.id)
      ) {
        return;
      }

      if (pc.remoteDescription?.type === "answer" && !iceRestart) {
        clearOfferRetries();
        return;
      }

      if (iceRestart && pc.signalingState === "stable") {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
      } else if (!pc.localDescription || pc.localDescription.type !== "offer") {
        if (pc.signalingState !== "stable") {
          return;
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
      }

      const localDescription = pc.localDescription;

      if (!localDescription) {
        return;
      }

      await sendScopedSignal({
        kind: "offer",
        description: localDescription,
      });
      logWebRtcEvent(iceRestart ? "ice_restart_offer_sent" : "offer_sent", {
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        signalingState: pc.signalingState,
      }, nextMatch);
    }

    function scheduleOfferRetries() {
      clearOfferRetries();
      offerRetryTimersRef.current = [250, 1000, 2200, 4000, 6500, 9000, 12000].map(
        (delay) =>
          window.setTimeout(() => {
            void sendOffer();
          }, delay),
      );
    }

    function scheduleConnectionWatchdogs() {
      clearConnectionWatchdogs();
      connectionWatchdogTimersRef.current = [
        window.setTimeout(() => {
          if (
            !isCurrentConnection(connectionToken, pc, nextMatch.id) ||
            pc.connectionState === "connected"
          ) {
            return;
          }

          logWebRtcEvent("connection_retry", {
            connectionState: pc.connectionState,
            iceConnectionState: pc.iceConnectionState,
            signalingState: pc.signalingState,
          }, nextMatch);

          if (nextMatch.role === "caller") {
            setMessage("Peer trovato. Ritento il collegamento WebRTC.");
            void sendOffer(Boolean(pc.remoteDescription));
          } else {
            setMessage("Peer trovato. Attendo ancora l'offerta WebRTC.");
          }
        }, 10000),
        window.setTimeout(() => {
          if (
            !isCurrentConnection(connectionToken, pc, nextMatch.id) ||
            pc.connectionState === "connected"
          ) {
            return;
          }

          logWebRtcEvent("connection_timeout", {
            connectionState: pc.connectionState,
            iceConnectionState: pc.iceConnectionState,
            signalingState: pc.signalingState,
            detail: pc.remoteDescription
              ? "ice_or_media_not_connected"
              : "no_remote_description",
          }, nextMatch);
          scheduleAutoNext(
            pc.remoteDescription
              ? "WebRTC non si e' stabilito su questa rete."
              : "Il signaling non si e' completato.",
            pc.remoteDescription ? "webrtc_timeout" : "signaling_timeout",
          );
        }, 22000),
      ];
    }

    const signalPollingToken = signalPollingTokenRef.current + 1;
    signalPollingTokenRef.current = signalPollingToken;
    void pollSignals(pc, signalPollingToken, nextMatch, sendScopedSignal);
    logWebRtcEvent("signal_poll_start", {
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      signalingState: pc.signalingState,
    }, nextMatch);

    if (nextMatch.role === "caller") {
      setMessage("Peer trovato. Invio offer WebRTC.");
      scheduleOfferRetries();
      void sendOffer();
    } else {
      setMessage("Peer trovato. Attendo l'offerta WebRTC.");
    }

    scheduleConnectionWatchdogs();
  }

  async function pollForMatch(searchReason = "start") {
    if (isPollingForMatchRef.current) {
      return;
    }

    const searchToken = matchSearchTokenRef.current + 1;
    matchSearchTokenRef.current = searchToken;
    isPollingForMatchRef.current = true;
    const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
    const searchStartedAt = Date.now();

    trackChatEvent("match_search_started", {
      preferred_country: isPremium ? preferredCountry : "any",
      preferred_language: isAuthenticated ? preferredLanguage : "any",
      search_reason: searchReason,
    });

    try {
      while (
        searchingRef.current &&
        matchSearchTokenRef.current === searchToken &&
        !matchRef.current
      ) {
        const response = await fetch("/api/matchmaking/join", {
          method: "POST",
          headers,
          body: JSON.stringify({
            ageConfirmed,
            rulesAccepted,
            language: "it",
            country: "IT",
            preferredLanguage: isAuthenticated ? preferredLanguage : "any",
            preferredCountry: isPremium ? preferredCountry : "any",
          }),
        });
        const data = (await response.json()) as MatchJoinResponse;

        if (matchSearchTokenRef.current !== searchToken) {
          return;
        }

        if (data.status === "matched") {
          trackChatEvent("match_found", {
            call_limit_sec: data.match.limitSeconds,
            match_wait_ms: Date.now() - searchStartedAt,
            role: data.match.role,
            search_reason: searchReason,
          });
          await connectToMatch(data.match);
          onProfileRefresh();
          return;
        }

        if (data.status !== "waiting") {
          trackChatEvent(
            data.status === "limit_reached"
              ? "free_limit_reached"
              : "match_search_blocked",
            {
              http_status: response.status,
              match_status: data.status,
              search_reason: searchReason,
            },
          );
          setStatus("idle");
          setMessage(data.message);
          searchingRef.current = false;
          onProfileRefresh();
          return;
        }

        setStatus("waiting");
        setMessage(data.message);
        await new Promise((resolve) =>
          window.setTimeout(resolve, data.retryAfterMs),
        );
      }
    } finally {
      if (matchSearchTokenRef.current === searchToken) {
        isPollingForMatchRef.current = false;
      }
    }
  }

  async function start() {
    trackChatEvent("chat_start_attempted");

    if (!ageConfirmed || !rulesAccepted) {
      trackChatEvent("chat_start_blocked", {
        block_reason: "age_or_rules",
      });
      setMessage("Conferma 18+ e accetta le regole prima di iniziare.");
      return;
    }

    if (!supabase) {
      trackChatEvent("chat_start_blocked", {
        block_reason: "supabase_missing",
      });
      setMessage("Configura Supabase per matchmaking e signaling.");
      return;
    }

    try {
      await ensureMedia();
      await cleanupConnection(true);
      searchingRef.current = true;
      await pollForMatch("start");
    } catch (error) {
      trackChatEvent("chat_start_failed", {
        failure_reason: error instanceof Error ? error.name : "unknown",
      });
      searchingRef.current = false;
      setStatus("idle");
      setMessage(
        error instanceof Error
          ? error.message
          : "Non riesco ad avviare la videochat.",
      );
    }
  }

  async function stop() {
    trackChatEvent("stop_clicked", {
      call_state: connectedAtRef.current ? "connected" : "not_connected",
    });
    searchingRef.current = false;
    await cleanupConnection(false);
    setStatus("idle");
    setMessage("Chiamata terminata.");
    onProfileRefresh();
  }

  async function goToNext(options: { reason?: string } = {}) {
    const nextReason = options.reason ?? "next";

    await cleanupConnection(true, nextReason);
    setStatus("waiting");
    setMessage("Cerco un nuovo match.");
    searchingRef.current = true;
    await pollForMatch(nextReason);
  }

  async function manualNext() {
    if (Date.now() < nextLockedUntil) {
      trackChatEvent("next_blocked", {
        block_reason: "cooldown",
      });
      return;
    }

    const cooldownSeconds = match?.nextCooldownSeconds ?? 8;
    trackChatEvent("next_clicked", {
      call_state: connectedAtRef.current ? "connected" : "not_connected",
      cooldown_sec: cooldownSeconds,
    });
    setNextLockedUntil(Date.now() + cooldownSeconds * 1000);
    setNextLockedSeconds(cooldownSeconds);

    await goToNext({ reason: "next" });
  }

  async function reportPeer() {
    const currentMatch = matchRef.current;

    if (!currentMatch) {
      return;
    }

    const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
    const response = await fetch("/api/report", {
      method: "POST",
      headers,
      body: JSON.stringify({
        matchId: currentMatch.id,
        reason: reportReason,
      }),
    });
    const data = (await response.json()) as { ok: boolean; message?: string };

    if (data.ok) {
      trackChatEvent("report_submitted", {
        report_reason: reportReason,
      });
    } else {
      trackChatEvent("report_failed", {
        http_status: response.status,
        report_reason: reportReason,
      });
    }

    setMessage(data.ok ? "Report inviato alla moderazione." : data.message ?? "Report fallito.");
  }

  const isStartBusy =
    status === "permissions" || status === "waiting" || status === "connecting";

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_0.56fr]">
        <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-black">
          <video
            ref={remoteVideoRef}
            className="h-full min-h-[420px] w-full object-cover"
            autoPlay
            playsInline
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
            {status !== "connected" ? (
              <div className="rounded-lg border border-white/10 bg-black/60 px-4 py-3 backdrop-blur">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            ) : null}
          </div>
          <div className="absolute left-3 top-3 rounded-md border border-white/10 bg-black/60 px-3 py-1 text-xs font-semibold text-slate-100">
            {match
              ? connectedAt
                ? formatTime(elapsed)
                : "In connessione"
              : status === "waiting"
                ? "In coda"
                : "Offline"}
          </div>
          <div className="absolute bottom-3 right-3 w-36 overflow-hidden rounded-lg border border-white/15 bg-black">
            <video
              ref={localVideoRef}
              className="aspect-video w-full object-cover"
              autoPlay
              muted
              playsInline
            />
          </div>
        </div>

        <aside className="grid content-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Stanza 1:1</h2>
            <p className="mt-1 text-xs text-slate-400">
              WebRTC peer-to-peer, nessuna registrazione audio/video.
            </p>
          </div>

          <div className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-3">
            <label className="flex items-start gap-2 text-xs text-slate-300">
              <input
                className="mt-0.5 h-4 w-4 accent-teal-300"
                type="checkbox"
                checked={ageConfirmed}
                onChange={(event) => {
                  const checked = event.target.checked;

                  setAgeConfirmed(checked);
                  if (checked) {
                    trackChatEvent("age_gate_confirmed");
                  }
                }}
              />
              Confermo di avere almeno 18 anni.
            </label>
            <label className="flex items-start gap-2 text-xs text-slate-300">
              <input
                className="mt-0.5 h-4 w-4 accent-teal-300"
                type="checkbox"
                checked={rulesAccepted}
                onChange={(event) => {
                  const checked = event.target.checked;

                  setRulesAccepted(checked);
                  if (checked) {
                    trackChatEvent("community_rules_accepted");
                  }
                }}
              />
              Accetto regole: niente nudità, spam, minacce o contenuti illegali.
            </label>
          </div>

          {isAuthenticated ? (
            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-xs text-slate-300">
                Lingua
                <select
                  className="h-10 rounded-md border border-white/10 bg-black/30 px-2 text-sm text-white outline-none disabled:opacity-45"
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value)}
                  disabled={!isAuthenticated}
                >
                  {languages.map((language) => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-slate-300">
                Paese / regione
                <select
                  className="h-10 rounded-md border border-white/10 bg-black/30 px-2 text-sm text-white outline-none disabled:opacity-45"
                  value={preferredCountry}
                  onChange={(event) => setPreferredCountry(event.target.value)}
                  disabled={!isPremium}
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={start}
              disabled={isStartBusy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-300 px-3 text-sm font-bold text-slate-950 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isStartBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              Entra live
            </button>
            <button
              type="button"
              onClick={manualNext}
              disabled={!match || nextLockedSeconds > 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RefreshCw className="h-4 w-4" />
              {nextLockedSeconds > 0 ? `${nextLockedSeconds}s` : "Next"}
            </button>
            <button
              type="button"
              onClick={stop}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-rose-300/30 px-3 text-sm font-semibold text-rose-100 hover:bg-rose-300/10"
            >
              <CircleStop className="h-4 w-4" />
              Stop
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <select
              className="h-10 rounded-md border border-white/10 bg-black/30 px-2 text-sm text-white outline-none"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            >
              <option value="nudity">Nudità</option>
              <option value="spam">Spam</option>
              <option value="threats">Minacce</option>
              <option value="minor">Minore</option>
              <option value="illegal">Illegale</option>
              <option value="other">Altro</option>
            </select>
            <button
              type="button"
              onClick={reportPeer}
              disabled={!match}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-amber-300/30 px-3 text-sm font-semibold text-amber-100 hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <BadgeAlert className="h-4 w-4" />
              Report
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2">
              <Video className="h-4 w-4 text-teal-200" />
              Camera locale
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2">
              <Mic className="h-4 w-4 text-teal-200" />
              Audio diretto
            </div>
          </div>

          {status === "failed" ? (
            <div className="flex gap-2 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              Se il peer si disconnette o WebRTC fallisce, cerco automaticamente un nuovo match.
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
