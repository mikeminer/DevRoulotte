import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Cookie | DevRoulotte",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie"
      updatedAt="27 giugno 2026"
      intro="Questa pagina descrive gli strumenti tecnici e le preferenze cookie dell'MVP DevRoulotte. Non e' consulenza legale: prima del lancio pubblico serve revisione professionale."
      sections={[
        {
          title: "Strumenti necessari",
          body: [
            "DevRoulotte usa strumenti tecnici strettamente necessari per fornire il servizio richiesto: login Supabase, sessione utente, ID ospite, conferma 18+, accettazione regole community, limiti Free, sicurezza, report e gestione ban.",
            "Questi strumenti sono necessari al funzionamento della videochat, alla prevenzione degli abusi e alla memorizzazione delle scelte privacy/cookie. Non richiedono consenso preventivo, ma devono essere descritti in modo trasparente.",
          ],
        },
        {
          title: "Scelte opzionali",
          body: [
            "Le categorie Preferenze, Statistiche e Marketing sono disattivate di default e possono essere accettate o rifiutate separatamente dal centro preferenze cookie.",
            "La categoria Statistiche abilita Google Analytics 4 solo dopo consenso. La categoria Marketing resta predisposta ma non carica pixel pubblicitari o strumenti promozionali nell'MVP.",
            "Se rifiuti o revochi Statistiche, DevRoulotte non carica il tag Google Analytics e prova a cancellare i cookie analytics gia' presenti sul dominio.",
          ],
        },
        {
          title: "Elenco operativo attuale",
          body: [
            "`devroulotte_cookie_consent_v2`: salva la scelta cookie nel browser.",
            "`devroulotte_guest_id`: identifica l'ospite per limiti Free, matchmaking, report e ban.",
            "`devroulotte_age_18`: ricorda la dichiarazione 18+.",
            "`devroulotte_rules_ok`: ricorda l'accettazione delle regole community.",
            "Supabase Auth puo' salvare token di sessione nel browser quando l'utente effettua login o registrazione.",
            "Google Analytics 4, se configurato con `NEXT_PUBLIC_GA_MEASUREMENT_ID` e accettato in Statistiche, carica `gtag.js` da `googletagmanager.com` e puo' impostare cookie come `_ga` e `_ga_<measurement-id>` per misurazioni aggregate.",
          ],
        },
        {
          title: "Modifica o revoca",
          body: [
            "Puoi riaprire il centro preferenze dal pulsante Cookie presente nell'interfaccia e modificare o revocare le scelte opzionali in qualsiasi momento.",
            "La revoca non elimina gli strumenti tecnici necessari, ma impedisce l'uso futuro delle categorie opzionali rifiutate.",
          ],
        },
      ]}
    />
  );
}
