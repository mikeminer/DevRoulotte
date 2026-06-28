<img width="1254" height="1254" alt="560a3ac8-2086-4f52-8f44-c6ccdb722aab" src="https://github.com/user-attachments/assets/e84a2a25-13a3-4b58-8aea-966b720a4605" />

# DevRoulotte

Il networking, senza appuntamenti. MVP 18+ con webcam 1:1, WebRTC peer-to-peer, matching random, tier Free ospite, Registrato e Premium da 3,99 EUR/mese senza prova gratuita via PayPal.

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
6. In Authentication > URL Configuration aggiungi gli URL di redirect per auth e reset password: `https://devroulotte.chat/auth/confirm`, `https://devroulotte.chat/reset-password`, `https://www.devroulotte.chat/auth/confirm`, `https://www.devroulotte.chat/reset-password`, `http://localhost:3000/auth/confirm`, `http://localhost:3000/reset-password`, `http://127.0.0.1:3000/auth/confirm` e `http://127.0.0.1:3000/reset-password`.

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

Tabelle principali:

- `auth.users`: utenti registrati Supabase
- `profiles`: profili registrati e ruolo admin
- `subscriptions`: stato PayPal Premium
- `reports`: segnalazioni
- `bans`: ban manuali e shadowban
- `match_logs`: log essenziali dei match
- `match_queue`: coda matchmaking
- `webrtc_signals`: offer/answer/ICE candidate temporanei per stabilire la chiamata WebRTC

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

Il campo `is_admin` e' protetto da trigger: un utente autenticato non puo' impostarlo dal client.

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

Durante il test tieni entrambe le pagine `/chat` aperte e attive dopo aver concesso webcam/microfono. Per evitare match fantasma, il backend crea match solo con peer visti negli ultimi `MATCH_QUEUE_ACTIVE_SECONDS` secondi, mentre `MATCH_QUEUE_STALE_SECONDS` resta la finestra piu' lunga usata per pulire la coda.

## Funzionalità incluse

- Landing page italiana su `/` con pitch DevRoulotte.chat e CTA verso `/chat`
- Esperienza videochat mobile-first scura su `/chat` con logo DevRoulotte
- Accesso guest o registrato via Supabase Auth
- Conferma obbligatoria 18+ e regole community
- Piano Free ospite: 3 match/giorno, chiamate da 2 minuti, rate limit Next
- Piano Registrato: 15 match/giorno, chiamate da 5 minuti, filtro lingua
- Piano Premium: match illimitati, chiamate da 15 minuti, filtri completi, priorità in coda, badge
- WebRTC audio/video P2P
- API signaling via Supabase `webrtc_signals`
- Pulsanti Start, Next, Stop, Report, Upgrade
- Report e auto-shadowban dopo troppi report
- Dashboard admin con report, ban/sban, subscription e match logs
- PayPal webhook verificato server-side
- Cloudflare TURN con credenziali temporanee
- Pagine Terms, Privacy, Regole community, Safety e Rimborsi
- Link "In officina" al form feedback/proposte: https://docs.google.com/forms/d/e/1FAIpQLSdiwzk0AGdbaPPRtEWR6QhnBRbfcLK-rJFf7es3J_Pnn-Ow8w/viewform
- Cancellazione Premium dal profilo
- Cleanup endpoint protetto per coda e match log stale

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
- `ADMIN_ACCESS_TOKEN`
- `CRON_SECRET`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` opzionale, solo se vuoi Google Analytics 4

## Policy prodotto

DevRoulotte è progettata solo per utenti 18+. Non registra chiamate, non salva stream audio/video e include regole esplicite contro nudità, spam, minacce e contenuti illegali.

## Cookie e consenso

L'app include un banner cookie con rifiuto opzionali, accetta tutto e personalizzazione granulare. Le categorie opzionali sono disattivate di default. Gli strumenti tecnici necessari coprono login, ID ospite, conferma 18+, regole, limiti Free, sicurezza e salvataggio della scelta. La pagina `/cookies` descrive gli strumenti attuali e dal pulsante Cookie l'utente puo' modificare o revocare le scelte.

Google Analytics 4 e' opzionale e viene caricato solo se:

1. `NEXT_PUBLIC_GA_MEASUREMENT_ID` contiene un Measurement ID GA4, ad esempio `G-XXXXXXXXXX`.
2. L'utente accetta la categoria Statistiche nel centro preferenze cookie.

Il consenso cookie usa `devroulotte_cookie_consent_v2`, cosi' chi aveva dato scelte prima dell'introduzione di GA vede nuovamente il banner. Se Statistiche viene rifiutato o revocato, il tag GA non viene caricato e l'app prova a cancellare i cookie Google Analytics gia' presenti sul dominio.

## Revisione legale

Prima di un lancio pubblico usa [docs/legal-review-pack.md](./docs/legal-review-pack.md) come pacchetto di revisione per avvocato/privacy consultant. Le pagine legali incluse sono bozze operative e non sostituiscono un parere professionale.

## Licenza

Il codice sorgente di DevRoulotte è distribuito sotto GNU Affero General Public License v3.0 only (`AGPL-3.0-only`). Vedi [LICENSE](./LICENSE).

Il nome DevRoulotte, il logo, il wordmark, gli asset di brand e l'identità visiva non sono coperti dalla licenza AGPLv3. Sono riservati: vedi [TRADEMARKS.md](./TRADEMARKS.md).
