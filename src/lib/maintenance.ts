export const MAINTENANCE_MODE =
  process.env.MAINTENANCE_MODE?.toLowerCase() === "true";

export const MAINTENANCE_MESSAGE =
  "DevRoulotte e' momentaneamente in manutenzione. Stiamo sistemando il collegamento peer-to-peer e torniamo online a breve.";
