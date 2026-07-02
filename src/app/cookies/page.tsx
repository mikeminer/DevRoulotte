import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Cookie | DevRoulotte",
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie"
      updatedAt="2 luglio 2026"
      intro={`Questa pagina descrive strumenti tecnici e preferenze cookie DevRoulotte. Per richieste privacy o cookie: ${CONTACT_EMAIL}.`}
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
            "Il Google tag usa Consent Mode con `analytics_storage` negato di default. La categoria Statistiche abilita Google Analytics 4 solo dopo consenso. La categoria Marketing resta predisposta ma non carica pixel pubblicitari o strumenti promozionali nell'MVP.",
            "Se rifiuti o revochi Statistiche, DevRoulotte non invia page view o eventi GA4, mantiene il consenso analytics negato e prova a cancellare i cookie analytics gia' presenti sul dominio. I contatori realtime aggregati mostrano solo dati disponibili in Google Analytics.",
          ],
        },
        {
          title: "Elenco operativo attuale",
          body: [
            "`devroulotte_cookie_consent_v2`: salva la scelta cookie nel browser.",
            "`__Host-devroulotte_guest`: cookie tecnico HttpOnly firmato che identifica la sessione ospite per limiti Free, matchmaking, report e ban. Non e' leggibile da JavaScript.",
            "`devroulotte_client_id`: ID locale non autenticante usato solo per distinguere i messaggi WebRTC del browser corrente.",
            "`devroulotte_weekly_opt_in_v2`: copia locale delle ultime scelte del Giro della settimana, usata per ripristinare la UI del browser. I conteggi condivisi arrivano da Supabase in forma aggregata.",
            "`devroulotte_age_18`: ricorda la dichiarazione 18+.",
            "`devroulotte_rules_ok`: ricorda l'accettazione delle regole community.",
            "Supabase Auth puo' salvare token di sessione nel browser quando l'utente effettua login o registrazione.",
            "Google Analytics 4, se configurato con `NEXT_PUBLIC_GA_MEASUREMENT_ID`, carica il Google tag da `googletagmanager.com` con consenso analytics negato di default. Solo se accetti Statistiche puo' impostare cookie come `_ga` e `_ga_<measurement-id>` per misurazioni aggregate di pagine, CTA, accesso, matching, chiamate connesse, report, checkout Premium, revenue PayPal confermata dal webhook e contatori realtime aggregati.",
            "La lettura server-side dei contatori realtime usa GA4 Data API con credenziali server-only e non espone chiavi Google nel browser.",
          ],
        },
        {
          title: "Modifica o revoca",
          body: [
            "Puoi riaprire il centro preferenze dal pulsante Cookie presente nell'interfaccia e modificare o revocare le scelte opzionali in qualsiasi momento.",
            "La revoca non elimina gli strumenti tecnici necessari, ma impedisce l'uso futuro delle categorie opzionali rifiutate.",
            `Per richieste relative a cookie, consenso o dati analytics scrivi a ${CONTACT_EMAIL} con oggetto "Richiesta privacy DevRoulotte".`,
          ],
        },
      ]}
    />
  );
}
