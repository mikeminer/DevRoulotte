import { createHmac, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname } from "node:path";

const port = Number(process.env.PORT || 8787);
const logPath =
  process.env.COLLECTOR_LOG_PATH ||
  "/var/log/devroulotte/collector.ndjson";
const appSecret = process.env.COLLECTOR_SHARED_SECRET || "";
const drainSecret = process.env.VERCEL_DRAIN_SECRET || "";
const maxBodyBytes = 1024 * 1024;

await mkdir(dirname(logPath), { recursive: true });

function constantTimeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function isAppRequestAuthorized(request) {
  const authorization = request.headers.authorization || "";

  return (
    appSecret.length >= 32 &&
    authorization.startsWith("Bearer ") &&
    constantTimeEqual(authorization.slice(7), appSecret)
  );
}

function isDrainRequestAuthorized(request, rawBody) {
  const signature = request.headers["x-vercel-signature"];

  if (!drainSecret || typeof signature !== "string") {
    return false;
  }

  const expected = createHmac("sha1", drainSecret)
    .update(rawBody)
    .digest("hex");

  return constantTimeEqual(signature, expected);
}

async function readBody(request) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    totalBytes += chunk.length;

    if (totalBytes > maxBodyBytes) {
      throw new Error("Payload too large");
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function normalizeDrainEvent(event) {
  if (typeof event?.text === "string" && event.text.trim().startsWith("{")) {
    try {
      return {
        ...event,
        ...JSON.parse(event.text),
        vercel: {
          deployment_id: event.deploymentId,
          project_id: event.projectId,
          source: event.source,
        },
      };
    } catch {
      return event;
    }
  }

  return event;
}

async function appendEvents(events) {
  const lines = events
    .map((event) => JSON.stringify(event))
    .join("\n");

  await appendFile(logPath, `${lines}\n`, "utf8");
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (
    request.method !== "POST" ||
    (request.url !== "/ingest/app" &&
      request.url !== "/ingest/vercel")
  ) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  try {
    const rawBody = await readBody(request);
    const authorized =
      request.url === "/ingest/app"
        ? isAppRequestAuthorized(request)
        : isDrainRequestAuthorized(request, rawBody);

    if (!authorized) {
      response.writeHead(401);
      response.end("Unauthorized");
      return;
    }

    const parsedBody = JSON.parse(rawBody);
    const events = (
      Array.isArray(parsedBody) ? parsedBody : [parsedBody]
    ).map((event) =>
      request.url === "/ingest/vercel"
        ? normalizeDrainEvent(event)
        : event,
    );

    await appendEvents(events);
    response.writeHead(202, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ accepted: events.length }));
  } catch (error) {
    const isPayloadError =
      error instanceof Error && error.message === "Payload too large";
    response.writeHead(isPayloadError ? 413 : 400);
    response.end(isPayloadError ? "Payload too large" : "Invalid payload");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      "@timestamp": new Date().toISOString(),
      message: "DevRoulotte observability collector started",
      port,
      log_path: logPath,
    }),
  );
});
