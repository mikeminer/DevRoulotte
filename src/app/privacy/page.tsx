import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { CONTACT_EMAIL } from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Privacy | DevRoulotte",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updatedAt="7 luglio 2026"
      intro={`Questa informativa descrive i dati trattati da DevRoulotte e la procedura privacy operativa. Contatto legale e privacy: ${CONTACT_EMAIL}.`}
      sections={[
        {
          title: "Titolare e contatto privacy",
          body: [
            `DevRoulotte e' il progetto responsabile del trattamento dei dati raccolti tramite devroulotte.chat. Il contatto legale e privacy operativo e' ${CONTACT_EMAIL}.`,
            "Se in futuro il progetto verra' gestito da una societa' o altra entita' giuridica, questa pagina sara' aggiornata con ragione sociale, sede e riferimenti completi.",
            "Non e' nominato un DPO/RPD. Per richieste privacy, contestazioni, rimozioni, accesso ai dati o segnalazioni di sicurezza usa il contatto indicato sopra.",
          ],
        },
        {
          title: "Dati trattati",
          body: [
            "Per utenti registrati trattiamo email, identificativo Supabase, profilo base, preferenze lingua/Paese e stato abbonamento.",
            "Se accedi con GitHub o LinkedIn tramite Supabase Auth, possiamo ricevere e conservare i dati OAuth necessari al login, come identificativo provider, email verificata se disponibile, nome utente, avatar pubblico e dati profilo essenziali restituiti dal provider scelto.",
            "Per ospiti usiamo un identificativo casuale salvato nel browser per applicare limiti, report e ban.",
            "Per il Giro della settimana trattiamo gli slot e i temi scelti dall'utente per generare una heatmap aggregata della settimana corrente. Queste preferenze non determinano il matchmaking live.",
            "Trattiamo inoltre dati tecnici come indirizzi IP visibili ai provider, user agent, log applicativi essenziali, eventi di errore, presenza temporanea in chat, stato online/offline e informazioni necessarie a sicurezza, limiti Free e prevenzione abusi.",
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
            "Salviamo log minimi dei match, report, ban, stato coda, presenza temporanea in /chat, stato premium e webhook PayPal necessari al funzionamento del servizio.",
            "Per stabilire WebRTC trattiamo temporaneamente offer/answer/ICE candidate di signaling. Questi dati non sono audio/video e vengono usati solo per collegare i due browser.",
            "Le preferenze del Giro della settimana vengono salvate con identificativo utente/ospite e settimana di riferimento, poi mostrate agli altri utenti solo come conteggi aggregati.",
            "PayPal gestisce i dati di pagamento. DevRoulotte riceve solo identificativi e stati subscription utili ad abilitare Premium.",
          ],
        },
        {
          title: "Finalita' e basi giuridiche",
          body: [
            "Erogazione del servizio: usiamo account, sessione, profilo, presenza temporanea in chat, matchmaking, signaling e stato Premium per fornire la videochat richiesta e gestire il rapporto con l'utente.",
            "Heatmap settimanale: usiamo gli slot e i temi dichiarati per mostrare conteggi aggregati della community nella settimana corrente, separati dal matchmaking live.",
            "Sicurezza e prevenzione abusi: usiamo log minimi, report, ban, limiti e controlli anti-spam per proteggere utenti, servizio e infrastruttura.",
            "Pagamenti e adempimenti: usiamo identificativi PayPal e stati subscription per attivare Premium, gestire cancellazioni, contestazioni e obblighi amministrativi.",
            "Statistiche opzionali: Google Analytics 4 viene usato solo dopo consenso alla categoria Statistiche per metriche aggregate su pagine, CTA, accesso, matching, chiamate connesse, report, checkout Premium, revenue PayPal confermata da webhook e contatori realtime aggregati non necessari; puoi revocare il consenso dal centro preferenze cookie.",
            "Revenue verificato opzionale: se configurato, PostHog riceve solo eventi server-side aggregati dal webhook PayPal verificato per misurare revenue Premium, con subscription e transaction ID hashati e senza ID PayPal leggibili.",
            "Comunicazioni di servizio: possiamo usare l'email dell'account per conferma registrazione, reset password, notifiche di sicurezza e comunicazioni strettamente legate al servizio.",
          ],
        },
        {
          title: "Cookie e strumenti simili",
          body: [
            "Usiamo strumenti tecnici necessari nel browser per login Supabase, incluso OAuth GitHub o LinkedIn se scelto dall'utente, ID ospite, conferma 18+, accettazione regole, limiti Free, sicurezza e preferenze cookie.",
            "Le categorie opzionali Preferenze, Statistiche e Marketing sono disattivate di default e modificabili dal centro preferenze.",
            "Il Google tag puo' essere caricato con Consent Mode e `analytics_storage` negato di default. La categoria Statistiche abilita Google Analytics 4 per misurare visite, pagine viste, CTA, eventi tecnici aggregati, revenue Premium confermata e contatori realtime aggregati non necessari solo dopo consenso e viene disattivata se revochi la categoria Statistiche.",
            "PostHog, se configurato, non carica cookie nel browser in questa implementazione: riceve solo eventi revenue server-side generati dal webhook PayPal verificato.",
          ],
        },
        {
          title: "Fornitori",
          body: [
            "Usiamo Vercel per hosting e API, Supabase per Auth/database/signaling temporaneo/presenza tecnica in chat, GitHub e LinkedIn come provider OAuth opzionali se scegli quei login, Cloudflare per STUN/TURN, PayPal per abbonamenti e, se accettato in Statistiche, Google Analytics 4 per metriche aggregate e contatori realtime aggregati non necessari. Se configurato, PostHog puo' ricevere eventi revenue server-side hashati dal webhook PayPal.",
            "Questi fornitori possono trattare dati tecnici secondo le rispettive policy e impostazioni account.",
            "Alcuni fornitori possono trattare dati fuori dallo Spazio Economico Europeo o con sub-responsabili internazionali. La valutazione definitiva di trasferimenti, SCC e ruoli privacy va mantenuta aggiornata in base ai contratti e alle impostazioni dei singoli provider.",
          ],
        },
        {
          title: "Conservazione",
          body: [
            "Account e profilo vengono conservati finche' l'account resta attivo o finche' servono per obblighi legali, sicurezza o gestione di contestazioni.",
            "Le preferenze cookie restano nel browser finche' non vengono modificate, revocate o cancellate dall'utente.",
            "Le preferenze del Giro della settimana vengono lette per settimana corrente; i periodi precedenti non alimentano la heatmap nuova e possono essere eliminati durante manutenzioni periodiche.",
            "La presenza tecnica in /chat viene conteggiata solo se aggiornata negli ultimi secondi e smette di essere attiva dopo una breve finestra di inattivita'.",
            "I dati di signaling WebRTC sono temporanei: la procedura di cleanup elimina i segnali piu' vecchi di circa 10 minuti.",
            "I log dei match e i report sono conservati in forma minima per sicurezza, audit anti-abuso, limiti Free, ban e contestazioni. I dati non piu' necessari vanno eliminati o anonimizzati durante le manutenzioni periodiche.",
            "I dati collegati a pagamenti, rimborsi e cancellazioni Premium possono essere conservati per il tempo richiesto da PayPal, obblighi fiscali, contabili o difesa da contestazioni.",
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
          title: "Diritti privacy",
          body: [
            "Puoi chiedere accesso ai dati, rettifica, cancellazione, limitazione del trattamento, portabilita' dei dati forniti, opposizione ai trattamenti basati su interesse legittimo e revoca del consenso per cookie/statistiche.",
            "La revoca del consenso non rende illecito il trattamento effettuato prima della revoca. Alcuni dati possono non essere cancellati subito quando servono per sicurezza, obblighi legali, contestazioni, prevenzione abusi o tutela di altri utenti.",
            "Non usiamo decisioni automatizzate con effetti giuridici significativi. Limiti, shadowban o blocchi anti-abuso possono essere rivisti manualmente scrivendo al contatto privacy.",
          ],
        },
        {
          title: "Procedura per richieste privacy",
          body: [
            `Invia una email a ${CONTACT_EMAIL} con oggetto "Richiesta privacy DevRoulotte".`,
            "Indica il diritto che vuoi esercitare, l'email dell'account se sei registrato, l'eventuale guest ID se stai usando il servizio come ospite, una descrizione chiara della richiesta e un recapito per la risposta.",
            "Per proteggere l'account possiamo chiedere informazioni aggiuntive proporzionate per verificare che la richiesta arrivi dalla persona interessata o da un delegato autorizzato.",
            "Rispondiamo di norma entro un mese dalla ricezione. Se la richiesta e' complessa o numerosa, possiamo estendere il termine fino a due mesi ulteriori informandoti del motivo.",
            "La richiesta e' gratuita, salvo casi manifestamente infondati, eccessivi o ripetitivi in cui potremmo rifiutare motivatamente o chiedere un contributo ragionevole nei limiti consentiti.",
            "Se non possiamo soddisfare integralmente una richiesta, spieghiamo il motivo, le parti eventualmente escluse e le possibilita' di contestazione.",
          ],
        },
        {
          title: "Cancellazione account e dati",
          body: [
            "Per cancellare l'account scrivi al contatto privacy indicando l'email dell'account. Disattiviamo o cancelliamo l'account Supabase e rimuoviamo i dati di profilo non piu' necessari.",
            "Prima di chiedere cancellazione, cancella eventuali abbonamenti Premium attivi da PayPal o dal profilo DevRoulotte. Alcuni identificativi subscription possono restare nei log necessari a pagamenti, sicurezza e contestazioni.",
            "Per ospiti possiamo eliminare o disassociare dati backend ragionevolmente collegabili al guest ID indicato, quando tecnicamente possibile e salvo necessita' di sicurezza o obblighi legali.",
          ],
        },
        {
          title: "Reclami e data breach",
          body: [
            `Se ritieni che una richiesta privacy non sia stata gestita correttamente, puoi scrivere prima a ${CONTACT_EMAIL} per una revisione interna.`,
            "Puoi inoltre proporre reclamo all'autorita' di controllo competente, in Italia il Garante per la protezione dei dati personali.",
            "In caso di violazione dei dati personali, DevRoulotte registra l'incidente, valuta rischio e impatto, mitiga il problema e, quando richiesto dal GDPR, notifica l'autorita' competente entro 72 ore dalla conoscenza e informa gli utenti interessati se il rischio e' elevato.",
          ],
        },
      ]}
    />
  );
}
