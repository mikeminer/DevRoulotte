import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy | DevRoulotte",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updatedAt="27 giugno 2026"
      intro="Questa informativa descrive i dati trattati dall'MVP DevRoulotte. Non e' consulenza legale: prima di una produzione commerciale serve revisione professionale."
      sections={[
        {
          title: "Dati trattati",
          body: [
            "Per utenti registrati trattiamo email, identificativo Supabase, profilo base, preferenze lingua/Paese e stato abbonamento.",
            "Per ospiti usiamo un identificativo casuale salvato nel browser per applicare limiti, report e ban.",
          ],
        },
        {
          title: "Video e audio",
          body: [
            "Non registriamo, non archiviamo e non analizziamo gli stream video/audio delle chiamate.",
            "Il browser puo' condividere camera e microfono solo dopo consenso esplicito dell'utente.",
          ],
        },
        {
          title: "Dati operativi",
          body: [
            "Salviamo log minimi dei match, report, ban, stato coda, stato premium e webhook PayPal necessari al funzionamento del servizio.",
            "Per stabilire WebRTC trattiamo temporaneamente offer/answer/ICE candidate di signaling. Questi dati non sono audio/video e vengono usati solo per collegare i due browser.",
            "PayPal gestisce i dati di pagamento. DevRoulotte riceve solo identificativi e stati subscription utili ad abilitare Premium.",
          ],
        },
        {
          title: "Cookie e strumenti simili",
          body: [
            "Usiamo strumenti tecnici necessari nel browser per login, ID ospite, conferma 18+, accettazione regole, limiti Free, sicurezza e preferenze cookie.",
            "Le categorie opzionali Preferenze, Statistiche e Marketing sono disattivate di default e modificabili dal centro preferenze.",
            "Il Google tag puo' essere caricato con Consent Mode e `analytics_storage` negato di default. La categoria Statistiche abilita Google Analytics 4 per misurare visite, pagine viste ed eventi tecnici aggregati solo dopo consenso e viene disattivata se revochi la categoria Statistiche.",
          ],
        },
        {
          title: "Fornitori",
          body: [
            "Usiamo Vercel per hosting e API, Supabase per Auth/database/signaling temporaneo, Cloudflare per STUN/TURN, PayPal per abbonamenti e, se accettato in Statistiche, Google Analytics 4 per metriche aggregate.",
            "Questi fornitori possono trattare dati tecnici secondo le rispettive policy e impostazioni account.",
          ],
        },
        {
          title: "Sicurezza",
          body: [
            "Le chiavi segrete restano lato server. L'accesso admin richiede token server-side o ruolo admin su Supabase.",
            "RLS e API server-side proteggono i dati principali, ma il rate limit in memoria e' da rafforzare con storage condiviso se il traffico cresce.",
          ],
        },
        {
          title: "Diritti",
          body: [
            "Gli utenti possono chiedere aggiornamento, cancellazione o limitazione dei dati dove applicabile.",
            "Prima del lancio pubblico devi inserire contatti legali reali e una procedura privacy completa.",
          ],
        },
      ]}
    />
  );
}
