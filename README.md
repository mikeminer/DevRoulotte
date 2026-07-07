<img width="1254" height="1254" alt="560a3ac8-2086-4f52-8f44-c6ccdb722aab" src="https://github.com/user-attachments/assets/e84a2a25-13a3-4b58-8aea-966b720a4605" />

# DevRoulotte

Incontri casuali, ma non a caso. MVP 18+ da superconnector 1:1 per founder, builder e professionisti italiani, con webcam WebRTC, matching random live, heatmap settimanale delle disponibilità dichiarate, tier Free ospite, Registrato e Premium da 3,99 EUR/mese senza prova gratuita via PayPal.

## Stack

- Next.js 16 App Router, TypeScript, React 19, Tailwind CSS 4
- Vercel per frontend e API routes
- Supabase free tier per Auth, database, signaling temporaneo, moderazione e subscription state
- WebRTC P2P per audio/video, senza registrazione audio/video
- Cloudflare STUN gratuito e Cloudflare Realtime TURN come fallback
- PayPal Subscriptions per Premium

## Nota importante su WebSocket e Vercel

Le API route serverless di Vercel non sono pensate per mantenere WebSocket persistenti. Per restare compatibili con Vercel e non aggiungere un server a pagamento, l'MVP usa API routes + Supabase DB come signaling temporaneo: offer/answer/ICE candidate vengono scritti in `webrtc_signals` e letti via polling breve dai due peer.

Questo fallback e' meno istantaneo di un WebSocket dedicato, ma resta gratuito, compatibile con Vercel e piu' prevedibile su reti dove Supabase Realtime/WebSocket e' lento o bloccato. I segnali WebRTC sono temporanei e non contengono audio/video.

## Avvio locale

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Apri `http://localhost:3000`.

Senza credenziali reali l'app renderizza la UI, ma matchmaking, auth, admin, PayPal e signaling richiedono Supabase configurato.

## Supabase

1. Crea un progetto Supabase.
2. In SQL Editor esegui [supabase/schema.sql](./supabase/schema.sql).
3. In Authentication abilita Email/Password.
4. Copia Project URL e publishable/anon key in `.env.local`.
5. Copia la service role/secret key in `SUPABASE_SERVICE_ROLE_KEY`.
6. In Authentication > URL Configuration aggiungi gli URL di redirect per auth, reset password e OAuth: `https://devroulotte.chat/auth/confirm`, `https://devroulotte.chat/reset-password`, `https://devroulotte.chat/chat`, `https://www.devroulotte.chat/auth/confirm`, `https://www.devroulotte.chat/reset-password`, `https://www.devroulotte.chat/chat`, `http://localhost:3000/auth/confirm`, `http://localhost:3000/reset-password`, `http://localhost:3000/chat`, `http://127.0.0.1:3000/auth/confirm`, `http://127.0.0.1:3000/reset-password` e `http://127.0.0.1:3000/chat`.

Nota: per Supabase hosted questi redirect vanno salvati nel dashboard del progetto. `supabase/config.toml` mantiene l'equivalente configurazione locale/versionata.

Configurazione rapida da terminale, dopo aver recuperato le chiavi dal dashboard Supabase:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
$env:SUPABASE_SERVICE_ROLE_KEY="..."
$env:SUPABASE_DB_URL="postgresql://postgres.your-project:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require"
./scripts/configure-supabase.ps1 -DisableNodeTlsVerification
```

`SUPABASE_DB_URL` serve solo per applicare lo schema via `psql`. Se non hai `psql`, esegui manualmente `supabase/schema.sql` nel SQL Editor e poi lancia lo script con `-SkipSchema`.

Se il progetto Supabase e' gia' configurato e devi solo aggiungere il signaling DB, esegui nel SQL Editor [supabase/migrations/20260627_webrtc_signals.sql](./supabase/migrations/20260627_webrtc_signals.sql).

### Hardening post pentest

Per chiudere il report KOS-2026-0630-001 applica anche [supabase/migrations/20260701_security_hardening.sql](./supabase/migrations/20260701_security_hardening.sql). La migration:

- blocca modifiche client a `profiles.is_shadow_banned`, oltre a `is_admin`;
- rimuove campi privilegiati da `auth.users.raw_user_meta_data`;
- installa un trigger che impedisce nuovi `user_metadata` privilegiati come `is_admin`, `role`, `permissions`.

Nel dashboard Supabase hosted allinea anche Authentication:

- Email confirmations: enabled.
- Minimum password length: `10`.
- Password requirements: `lower_upper_letters_digits`.
- Secure password change: enabled.
- Email max frequency: almeno `60s`.

### Login con GitHub e LinkedIn

DevRoulotte supporta login GitHub e LinkedIn tramite Supabase Auth OAuth. Non servono nuove variabili ambiente nel client: il browser usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` gia' presenti.

1. In Supabase Dashboard apri Authentication > Sign In / Providers > GitHub e copia il Callback URL, nel formato `https://<project-ref>.supabase.co/auth/v1/callback`.
2. In GitHub Developer settings > OAuth Apps crea una nuova OAuth App:
   - Application name: `DevRoulotte`
   - Homepage URL: `https://devroulotte.chat`
   - Authorization callback URL: il Callback URL copiato da Supabase.
3. Copia Client ID e Client Secret da GitHub dentro il provider GitHub di Supabase e abilitalo.
4. In Supabase Authentication > URL Configuration verifica che tra i redirect consentiti ci siano `https://devroulotte.chat/chat`, `https://www.devroulotte.chat/chat`, `http://localhost:3000/chat` e `http://127.0.0.1:3000/chat`.

Il pulsante "Continua con GitHub" nel pannello Accesso usa `signInWithOAuth({ provider: "github" })` e rientra su `/chat` dopo il login.

Per LinkedIn usa il provider Supabase `LinkedIn (OIDC)`:

1. In Supabase Dashboard apri Authentication > Sign In / Providers > LinkedIn e copia lo stesso Callback URL `https://<project-ref>.supabase.co/auth/v1/callback`.
2. In LinkedIn Developer Portal crea o apri l'app DevRoulotte.
3. Nella sezione Products richiedi/abilita `Sign In with LinkedIn using OpenID Connect`.
4. Nella sezione Auth aggiungi il Callback URL Supabase tra gli Authorized Redirect URLs.
5. Copia Client ID e Client Secret da LinkedIn dentro il provider `LinkedIn (OIDC)` di Supabase e abilitalo.

Il pulsante "Continua con LinkedIn" nel pannello Accesso usa `signInWithOAuth({ provider: "linkedin_oidc" })` e rientra su `/chat` dopo il login.

Con un Supabase Personal Access Token puoi applicare queste impostazioni via Management API:

```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_..."
$env:SUPABASE_PROJECT_REF="augmsieaeqskjsaozhtp"
./scripts/configure-supabase-auth-security.ps1
```

In Vercel aggiungi `GUEST_SESSION_SECRET` come variabile server-only lunga e casuale. Le sessioni ospite non usano piu' `x-guest-id`: l'identita' guest e' firmata in un cookie HttpOnly `__Host-devroulotte_guest`, mentre i peer vedono solo alias pubblici match-scoped.

Tabelle principali:

- `auth.users`: utenti registrati Supabase
- `profiles`: profili registrati e ruolo admin
- `subscriptions`: stato PayPal Premium
- `reports`: segnalazioni
- `bans`: ban manuali e shadowban
- `match_logs`: log essenziali dei match
- `match_queue`: coda matchmaking, inclusa la parola di sintonia Premium temporanea quando usata
- `webrtc_signals`: offer/answer/ICE candidate temporanei per stabilire la chiamata WebRTC
- `weekly_opt_ins`: preferenze aggregate per la heatmap settimanale, separata dal matchmaking

Le chiamate audio/video non vengono salvate. I log contengono solo actor id, stato, timestamp, canale di signaling e diagnostica tecnica redatta.

### Admin

La dashboard `/admin` accetta due modalita':

- `ADMIN_ACCESS_TOKEN` come fallback operativo.
- Login Supabase con `profiles.is_admin = true`.

Per promuovere un utente registrato ad admin, esegui nel SQL Editor Supabase:

```sql
update public.profiles
set is_admin = true
where id = (
  select id
  from auth.users
  where email = 'admin@example.com'
);
```

I campi `is_admin` e `is_shadow_banned` sono protetti da trigger: un utente autenticato non puo' impostarli o ripulirli dal client.

### Email Supabase brandizzate

I template HTML DevRoulotte sono versionati in [supabase/templates](./supabase/templates) e collegati in [supabase/config.toml](./supabase/config.toml). Coprono conferma account, reset password, magic link, invito, cambio email, reauth e notifiche sicurezza base.

Il template di reset password usa `{{ .ConfirmationURL }}`, cioe' il link ufficiale firmato da Supabase. La chiamata `resetPasswordForEmail` imposta `redirectTo=/reset-password`, quindi dopo la verifica l'utente arriva direttamente alla pagina di cambio password. L'app mantiene anche un redirect globale per eventuali link recovery classici che emettono l'evento `PASSWORD_RECOVERY`.

Per applicarli al progetto Supabase hosted via Management API:

```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_..." # crea un Personal Access Token dal dashboard Supabase
./scripts/configure-supabase-email-templates.ps1
```

Lo script legge il project ref da `supabase/.temp/project-ref` se presente. Per provare senza modificare Supabase:

```powershell
./scripts/configure-supabase-email-templates.ps1 -DryRun
```

Nota importante: questi template brandizzano soggetto e corpo email. Per avere anche il mittente brandizzato, ad esempio `DevRoulotte <no-reply@devroulotte.chat>`, configura Authentication > Emails > SMTP Settings con un provider SMTP e dominio verificato. Evita email tracking sui link di auth, perche' puo' rompere i link Supabase.

Su Supabase Free la modifica dei template richiede un provider SMTP custom. Esempio gratuito con Resend:

1. Crea un account Resend e verifica `devroulotte.chat`.
2. Aggiungi nel DNS del dominio i record richiesti da Resend.
3. Crea una API key Resend.
4. Copia `.supabase-smtp.local.example.json` in `.supabase-smtp.local.json` e inserisci la API key nel campo `password`.
5. Applica SMTP e template:

```powershell
./scripts/configure-supabase-smtp.ps1
```

Per Resend i valori SMTP sono: host `smtp.resend.com`, porta `587`, utente `resend`, password uguale alla API key Resend. Il file `.supabase-smtp.local.json` e' ignorato da Git.

## Cloudflare STUN/TURN

STUN funziona subito con:

```txt
stun:stun.cloudflare.com:3478
stun:stun.cloudflare.com:53
```

Per TURN:

1. In Cloudflare crea un API token con permesso account `Calls Write`.
2. Inserisci account id e token in `.cloudflare-turn.local.json`.
3. Lancia:

```powershell
./scripts/configure-cloudflare-turn.ps1 -DisableNodeTlsVerification
```

Lo script crea la TURN key, testa `generate-ice-servers`, aggiorna `.env.local`, sincronizza `CLOUDFLARE_TURN_KEY_ID` e `CLOUDFLARE_TURN_API_TOKEN` su Vercel e ridistribuisce in produzione. L'API route `/api/ice` genera poi credenziali TURN temporanee lato server e restituisce solo username/password short-lived al browser.

Se hai gia' una TURN key, puoi compilare direttamente `turnKeyId` e `turnApiToken` nel file `.cloudflare-turn.local.json` e lo script saltera' la creazione.

Riferimenti: [Cloudflare TURN credentials](https://developers.cloudflare.com/realtime/turn/generate-credentials/) e [Cloudflare TURN FAQ/pricing](https://developers.cloudflare.com/realtime/turn/faq/).

## PayPal Subscriptions

1. Crea una REST App in PayPal Developer Sandbox o Live.
2. Inserisci `mode`, `clientId` e `clientSecret` in `.paypal-credentials.local.json`.
3. Lancia:

```powershell
./scripts/configure-paypal.ps1 -DisableNodeTlsVerification
```

Lo script crea Product, Plan Premium `3.99 EUR` mensile senza prova gratuita, webhook su `https://devroulotte.chat/api/paypal/webhook`, aggiorna `.env.local`, sincronizza le env su Vercel e ridistribuisce in produzione.

Se hai gia' creato piano o webhook nel dashboard PayPal, puoi valorizzare `planId` e `webhookId` nel file `.paypal-credentials.local.json` e lo script li riusera'. Se stai passando da un vecchio piano con trial, crea un nuovo piano senza prova gratuita con:

```powershell
./scripts/configure-paypal.ps1 -ForceNewPlan -DisableNodeTlsVerification
```

Lo script aggiorna `PAYPAL_PLAN_ID` in `.env.local`, Vercel e `.paypal-credentials.local.json`.

L'upgrade chiama `/api/paypal/create-subscription`, crea la subscription server-side e reindirizza alla approval URL PayPal. Il webhook verifica la firma con PayPal prima di aggiornare Supabase.

La cancellazione Premium e' disponibile dal profilo e chiama `/api/paypal/cancel-subscription`, che annulla la subscription PayPal server-side e aggiorna Supabase. L'utente puo' sempre cancellare anche dal proprio account PayPal.

Riferimenti: [PayPal Subscriptions](https://developer.paypal.com/docs/subscriptions/integrate/) e [PayPal Webhooks](https://developer.paypal.com/api/rest/webhooks/).

## Vercel deploy

Il progetto e' pronto per Vercel e puo' usare il dominio `devroulotte.chat`.

1. Pusha il repository su GitHub.
2. Collega il repo al progetto Vercel `devroulotte`.
3. Framework: Next.js.
4. Verifica che `NEXT_PUBLIC_APP_URL=https://devroulotte.chat`.
5. Aggiungi le env mancanti con gli script PayPal/Cloudflare oppure da Project Settings.
6. Deploy.

Gli script di configurazione sincronizzano le variabili su `production`, `preview` e `development`. Per aggiornare manualmente:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
vercel env ls
vercel deploy --prod --yes --scope mikeminers-projects
```

Comandi utili:

```bash
npm run lint
npm run typecheck
npm run build
```

## Test matchmaking su due dispositivi

Per provare un match tra due computer, usa due identità diverse: due account diversi, oppure un computer loggato e l'altro come ospite/incognito. Se usi lo stesso account Supabase su entrambi i dispositivi, DevRoulotte li tratta come lo stesso attore e non li mette in match tra loro.

Il matching passa da Supabase `match_queue`, quindi funziona anche su Vercel senza memoria condivisa tra funzioni. Il signaling WebRTC usa API routes e `webrtc_signals`: il caller ritenta l'offer per qualche secondo e l'altro browser legge i segnali via polling breve.

Per testare la parola di sintonia Premium, usa due account Premium diversi e inserisci la stessa parola nel campo dedicato prima di entrare live. Chi non inserisce una parola resta nella roulette pubblica; chi inserisce una parola viene messo solo con utenti che hanno scritto la stessa parola.

Durante il test tieni entrambe le pagine `/chat` aperte e attive dopo aver concesso webcam/microfono. Per evitare match fantasma, il backend crea match solo con peer visti negli ultimi `MATCH_QUEUE_ACTIVE_SECONDS` secondi, mentre `MATCH_QUEUE_STALE_SECONDS` resta la finestra piu' lunga usata per pulire la coda.

## Webcam e microfono su mobile

Su iPhone e Android apri DevRoulotte in Safari o Chrome aggiornato, non dentro il browser interno di LinkedIn, Instagram, Product Hunt o altre app. I browser in-app possono bloccare `getUserMedia()` anche se il sito e' in HTTPS.

Se hai negato il permesso una volta, apri le impostazioni del sito per `devroulotte.chat` e rimetti Camera e Microfono su "Consenti". Chiudi eventuali app che stanno gia' usando camera o microfono, poi ricarica `/chat` e premi di nuovo "Entra nella roulotte".

## Funzionalità incluse

- Landing page italiana su `/` con posizionamento superconnector casuale 1:1 e CTA verso `/chat`
- Esperienza videochat mobile-first scura su `/chat` con logo DevRoulotte
- Pannello "Giro della settimana" con heatmap settimanale: gli slot più scelti dagli utenti diventano più intensi e la visualizzazione si resetta sulla settimana successiva
- Accesso guest o registrato via Supabase Auth con email/password, GitHub OAuth o LinkedIn OIDC
- Conferma obbligatoria 18+ e regole community
- Piano Free ospite: 3 match/giorno, chiamate da 2 minuti, rate limit Next
- Piano Registrato: 15 match/giorno, chiamate da 5 minuti, filtro lingua
- Piano Premium: match illimitati, chiamate da 15 minuti, filtri completi, priorità in coda, parola di sintonia 1:1, badge
- WebRTC audio/video P2P
- API signaling via Supabase `webrtc_signals`
- Pulsanti Entra live, Next, Stop, Report, Upgrade
- Report e auto-shadowban dopo troppi report
- Dashboard admin con report, ban/sban, subscription e match logs
- PayPal webhook verificato server-side
- Cloudflare TURN con credenziali temporanee
- Pagine Terms, Privacy, Regole community, Safety e Rimborsi
- Link "In officina" al form feedback/proposte: https://docs.google.com/forms/d/e/1FAIpQLSdiwzk0AGdbaPPRtEWR6QhnBRbfcLK-rJFf7es3J_Pnn-Ow8w/viewform
- Cancellazione Premium dal profilo
- Cleanup endpoint protetto per coda e match log stale

Nota prodotto: il "Giro della settimana" non influenza il matchmaking live e non crea appuntamenti. È una lettura aggregata della disponibilità dichiarata dagli utenti nella settimana corrente.

## Sicurezza e limiti MVP

- Le chiavi PayPal, Cloudflare TURN e Supabase service role restano solo lato server.
- RLS è abilitato sulle tabelle; guest e flussi critici passano da API route server-side.
- Il rate limit in memoria è sufficiente per MVP/dev, ma su Vercel multi-instance va spostato su DB/Redis/Upstash se il traffico cresce.
- Il matchmaking API non è una transazione serializzata perfetta: per produzione conviene spostare la selezione match in una funzione Postgres `rpc` con lock.
- La moderazione anti-nudità è policy/report-based. Per produzione serve un sistema di trust & safety più forte, sempre senza registrare audio/video.

## Cleanup coda

L'endpoint `/api/cron/cleanup` elimina righe stale da `match_queue` e chiude match log attivi troppo vecchi. Proteggilo con:

```txt
CRON_SECRET=una-stringa-lunga-casuale
```

Chiamata:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://devroulotte.chat/api/cron/cleanup
```

In alternativa puoi usare `x-admin-token: ADMIN_ACCESS_TOKEN` per esecuzioni manuali. Se vuoi automatizzarlo, configura un Vercel Cron o un monitor esterno gratuito che chiami questo endpoint.

## Status page

`/status` e `/api/status` mostrano uno stato applicativo, non una copia del dashboard Supabase. La pagina verifica:

- database profili e subscription su Supabase
- `match_queue`, `webrtc_signals` e `chat_presence` per matchmaking, signaling e presenza live
- Cloudflare TURN generando credenziali temporanee short-lived
- PayPal OAuth senza creare pagamenti o subscription
- configurazione GA4 realtime e stato email transazionale monitorato

Per dichiarare manualmente un incidente pubblico, imposta in Vercel:

```env
STATUS_INCIDENT_LEVEL=degraded
STATUS_INCIDENT_MESSAGE=Matchmaking in osservazione durante un intervento tecnico.
```

Rimuovi `STATUS_INCIDENT_MESSAGE` quando l'incidente e' chiuso. `MAINTENANCE_MODE=true` continua ad avere priorita' e mostra la pagina manutenzione.

## TODO credenziali reali

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF` setup only
- `SUPABASE_ACCESS_TOKEN` setup only
- `CLOUDFLARE_ACCOUNT_ID` setup only
- `CLOUDFLARE_API_TOKEN` setup only
- `CLOUDFLARE_TURN_KEY_ID`
- `CLOUDFLARE_TURN_API_TOKEN`
- `PAYPAL_MODE`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_PLAN_ID`
- `PAYPAL_WEBHOOK_ID`
- `GITHUB_MARKETPLACE_WEBHOOK_SECRET` opzionale server-only, necessario solo se pubblichi la listing GitHub Marketplace
- `ADMIN_ACCESS_TOKEN`
- `GUEST_SESSION_SECRET`
- `CRON_SECRET`
- `STATUS_INCIDENT_LEVEL` opzionale, solo per avvisi manuali su `/status`
- `STATUS_INCIDENT_MESSAGE` opzionale, solo per avvisi manuali su `/status`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` opzionale, solo se vuoi Google Analytics 4
- `GA4_API_SECRET` opzionale server-only, necessario per revenue PayPal via Measurement Protocol
- `GA4_MEASUREMENT_PROTOCOL_ENDPOINT` opzionale, default consigliato `https://region1.google-analytics.com/mp/collect`
- `GA4_PROPERTY_ID` opzionale server-only, necessario per contatori realtime GA4
- `GA4_SERVICE_ACCOUNT_JSON_BASE64` opzionale server-only, consigliato per GA4 Data API Realtime
- `GA4_CLIENT_EMAIL` e `GA4_PRIVATE_KEY` opzionali server-only, alternativa a `GA4_SERVICE_ACCOUNT_JSON_BASE64`
- `POSTHOG_PROJECT_API_KEY` opzionale server-only, necessario per inviare revenue PayPal verificato a PostHog
- `POSTHOG_HOST` opzionale, default consigliato `https://eu.i.posthog.com` per PostHog EU Cloud
- `POSTHOG_REVENUE_EVENT_NAME` opzionale, default `purchase_completed`
- `PREMIUM_MONTHLY_PRICE_EUR` opzionale, default `3.99`

## Policy prodotto

DevRoulotte è progettata solo per utenti 18+. Non registra chiamate, non salva stream audio/video e include regole esplicite contro nudità, spam, minacce e contenuti illegali.

## Cookie e consenso

L'app include un banner cookie con rifiuto opzionali, accetta tutto e personalizzazione granulare. Le categorie opzionali sono disattivate di default. Gli strumenti tecnici necessari coprono login, sessione ospite HttpOnly firmata, conferma 18+, regole, limiti Free, sicurezza e salvataggio della scelta. La pagina `/cookies` descrive gli strumenti attuali e dal pulsante Cookie l'utente puo' modificare o revocare le scelte.

Google Analytics 4 e' opzionale ed e' configurato tramite Google tag globale con Consent Mode:

1. `NEXT_PUBLIC_GA_MEASUREMENT_ID` contiene un Measurement ID GA4, ad esempio `G-XXXXXXXXXX`.
2. Il tag viene inizializzato con `analytics_storage` negato di default e `send_page_view: false`.
3. L'utente accetta la categoria Statistiche nel centro preferenze cookie.
4. Per il revenue server-side PayPal, crea un API secret in GA4 Admin > Data streams > Measurement Protocol API secrets e salvalo come `GA4_API_SECRET` solo nelle env server di Vercel.

I contatori realtime in landing e `/chat` usano invece GA4 Data API Realtime lato server:

1. Abilita Google Analytics Data API nel progetto Google Cloud collegato.
2. Crea una service account con chiave JSON.
3. Aggiungi l'email della service account in GA4 > Admin > Property access management con ruolo Viewer o Analyst.
4. Imposta `GA4_PROPERTY_ID` con l'ID numerico della property GA4, non il Measurement ID `G-...`.
5. Imposta `GA4_SERVICE_ACCOUNT_JSON_BASE64` con il JSON della service account codificato base64, oppure usa `GA4_CLIENT_EMAIL` e `GA4_PRIVATE_KEY`.

La landing mostra gli utenti attivi rilevati negli ultimi 30 minuti. La pagina `/chat` viene conteggiata tramite la dimensione realtime GA4 `unifiedScreenName`, usando il titolo pagina `Giro 1:1 | DevRoulotte`, ma con una finestra breve di 1 minuto e senza cache CDN sull'endpoint chat. Sono conteggi aggregati e dipendono dagli utenti misurati da GA4, quindi dal consenso Statistiche e dai limiti standard di Google Analytics Realtime; non sono una presenza istantanea perfetta.

Il consenso cookie usa `devroulotte_cookie_consent_v2`, cosi' chi aveva dato scelte prima dell'introduzione di GA vede nuovamente il banner. Se Statistiche viene rifiutato o revocato, l'app mantiene il consenso analytics negato, non invia page view o eventi GA4 e prova a cancellare i cookie Google Analytics gia' presenti sul dominio.

Il checkout PayPal salva il `client_id` GA4 solo se il cookie `_ga` esiste, quindi solo dopo consenso Statistiche. Il webhook PayPal invia poi un evento GA4 `purchase` tramite Measurement Protocol quando riceve `BILLING.SUBSCRIPTION.ACTIVATED` e la subscription passa ad `active`. L'evento usa `value: 3.99`, `currency: EUR`, `payment_provider: paypal` e un `transaction_id` hashato, non il PayPal subscription id in chiaro. Se manca consenso, manca `GA4_API_SECRET` o manca il client id GA4, Premium viene comunque attivato ma il revenue non viene inviato a Google.

PostHog Revenue e' opzionale e funziona come ponte server-side PayPal -> PostHog:

1. Crea un progetto PostHog, preferibilmente EU Cloud per utenti UE.
2. Copia il Project API key/token in `POSTHOG_PROJECT_API_KEY` nelle env server di Vercel.
3. Imposta `POSTHOG_HOST` su `https://eu.i.posthog.com` oppure `https://us.i.posthog.com`, in base alla regione del progetto.
4. Nel prodotto esterno che chiede "PostHog Revenue", collega PostHog e configura l'evento revenue `purchase_completed`, proprieta' importo `revenue`, valuta `currency`, prodotto `product` e subscription `subscription_id`.

Il webhook PayPal verificato invia a PostHog un evento `purchase_completed` quando riceve `BILLING.SUBSCRIPTION.ACTIVATED` e la subscription risulta `active`. L'importo viene inviato in minor unit (`399` per `3,99 EUR`) seguendo la raccomandazione PostHog, insieme a `revenue_decimal: 3.99`. `subscription_id` e `transaction_id` sono hash stabili, non gli ID PayPal leggibili. Se `POSTHOG_PROJECT_API_KEY` manca o PostHog risponde errore, Premium viene comunque attivato e l'errore resta salvato in `subscriptions.raw_json.posthog`.

## GitHub Marketplace

Per la pagina GitHub Marketplace usa come hook URL `https://devroulotte.chat/api/github/marketplace/webhook`, content type `application/json` e un secret salvato in Vercel come `GITHUB_MARKETPLACE_WEBHOOK_SECRET`. L'endpoint verifica `X-Hub-Signature-256`, risponde al `ping` di GitHub e registra solo metadati minimi degli eventi `marketplace_purchase`. I piani Premium reali restano gestiti da PayPal, quindi il webhook Marketplace non attiva abbonamenti DevRoulotte.

## Revisione legale

Prima di un lancio pubblico usa [docs/legal-review-pack.md](./docs/legal-review-pack.md) come pacchetto di revisione per avvocato/privacy consultant. Le pagine legali incluse sono bozze operative e non sostituiscono un parere professionale.

## Licenza

Il codice sorgente di DevRoulotte è distribuito sotto GNU Affero General Public License v3.0 only (`AGPL-3.0-only`). Vedi [LICENSE](./LICENSE).

Il nome DevRoulotte, il logo, il wordmark, gli asset di brand e l'identità visiva non sono coperti dalla licenza AGPLv3. Sono riservati: vedi [TRADEMARKS.md](./TRADEMARKS.md).
