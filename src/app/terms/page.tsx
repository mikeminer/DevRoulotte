import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Termini di servizio | DevRoulotte",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termini di servizio"
      updatedAt="27 giugno 2026"
      intro="DevRoulotte e' un servizio 18+ per networking casuale 1:1 via webcam. Usando il servizio accetti questi termini, le regole community e la nostra informativa privacy."
      sections={[
        {
          title: "Accesso 18+",
          body: [
            "Il servizio e' riservato a persone maggiorenni. Devi confermare di avere almeno 18 anni prima di iniziare un match.",
            "Chi dichiara di essere minorenne o appare usare il servizio come minorenne puo' essere bloccato immediatamente.",
          ],
        },
        {
          title: "Uso consentito",
          body: [
            "Puoi usare DevRoulotte per conversazioni legittime, networking e incontri casuali professionali o sociali.",
            "Sono vietati nudita', spam, minacce, molestie, contenuti illegali, frodi, raccolta invasiva di dati e qualunque uso contrario alla legge applicabile.",
          ],
        },
        {
          title: "Piani",
          body: [
            "Il piano Free ospite include 3 match al giorno, chiamate da 2 minuti e rate limit sul tasto Next.",
            "Il piano Registrato include 15 match al giorno, chiamate da 5 minuti e filtro lingua.",
            "Il piano Premium costa 3,99 EUR al mese, non include prova gratuita e abilita match illimitati, chiamate da 15 minuti, filtri completi e priorita' in coda.",
          ],
        },
        {
          title: "Moderazione",
          body: [
            "Possiamo ricevere report, applicare ban manuali, shadowban temporanei e limitazioni automatiche quando ci sono troppi report.",
            "La moderazione dell'MVP e' essenziale: non sostituisce verifiche professionali o sistemi avanzati di trust and safety.",
          ],
        },
        {
          title: "Nessuna registrazione delle chiamate",
          body: [
            "DevRoulotte non registra e non archivia video o audio delle chiamate. I flussi media viaggiano via WebRTC peer-to-peer quando possibile.",
            "Salviamo solo dati tecnici essenziali come profili, abbonamenti, report, ban e log minimi dei match.",
          ],
        },
        {
          title: "Disponibilita'",
          body: [
            "L'MVP usa servizi esterni come Vercel, Supabase, Cloudflare e PayPal. Interruzioni o limiti di questi servizi possono influire sul funzionamento.",
            "Possiamo modificare o sospendere funzioni per sicurezza, manutenzione, abuso o obblighi legali.",
          ],
        },
      ]}
    />
  );
}
