import { NextResponse } from "next/server";

export const runtime = "nodejs";

const fallbackIceServers = [
  {
    urls: ["stun:stun.cloudflare.com:3478", "stun:stun.cloudflare.com:53"],
  },
];

export async function GET() {
  const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
  const apiToken = process.env.CLOUDFLARE_TURN_API_TOKEN;

  if (!keyId || !apiToken) {
    return NextResponse.json({
      mode: "stun-only",
      iceServers: fallbackIceServers,
      message: "Cloudflare TURN non configurato: uso STUN gratuito.",
    });
  }

  try {
    const response = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: 86400 }),
      },
    );

    if (!response.ok) {
      throw new Error(`Cloudflare TURN failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      iceServers?: RTCIceServer[];
    };

    return NextResponse.json({
      mode: "turn",
      iceServers: data.iceServers?.length
        ? data.iceServers
        : fallbackIceServers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        mode: "stun-only",
        iceServers: fallbackIceServers,
        message:
          error instanceof Error
            ? error.message
            : "Impossibile generare credenziali TURN",
      },
      { status: 200 },
    );
  }
}
