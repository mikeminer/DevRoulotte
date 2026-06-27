const EMPTY_ERROR_MESSAGES = new Set(["{}", "[]", "null", "undefined"]);

function extractMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }

  return "";
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  const message = extractMessage(error).trim();

  if (!message || EMPTY_ERROR_MESSAGES.has(message)) {
    return fallback;
  }

  if (message.toLowerCase().includes("failed to fetch")) {
    return "Connessione non riuscita. Controlla la rete e riprova.";
  }

  return message;
}
