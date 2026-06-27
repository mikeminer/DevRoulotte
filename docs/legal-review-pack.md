# DevRoulotte legal review pack

Questo documento non e' un parere legale. Serve come pacchetto di lavoro da consegnare a un avvocato, privacy consultant o DPO prima di un lancio pubblico.

## Verdetto operativo pre-lancio

Non trattare questo documento come autorizzazione al lancio pubblico. Per un test privato controllato l'MVP e' tecnicamente pronto; per un lancio pubblico servono ancora validazione professionale e testi definitivi su privacy, termini, consumer/payments, moderazione e 18+.

Blocchi principali prima del pubblico:

- Identita' reale del titolare, contatti legali/privacy e giurisdizione.
- Informativa privacy completa con basi giuridiche, retention, fornitori, trasferimenti extra UE e diritti interessati.
- Terms, refunds e subscription flow revisionati per trial gratuito, rinnovo automatico, cancellazione e prezzo.
- Valutazione DSA/moderazione: punto di contatto, notice-and-action, gestione contenuti illegali e reclami.
- Valutazione 18+ e safety: self-declaration, sospetto minorenne, escalation e procedure interne.
- Retention reale implementata per match logs, report, ban e raw webhook PayPal.

## Stato prodotto

- Nome prodotto: DevRoulotte.
- Pubblico previsto: solo utenti 18+.
- Funzione principale: videochat casuale 1:1 via WebRTC peer-to-peer.
- Registrazione audio/video: non prevista e non implementata.
- Piani: Free e Premium PayPal a 3,99 EUR/mese con prova gratuita di 5 giorni.
- Hosting/API: Vercel.
- Database/Auth/signaling temporaneo: Supabase.
- STUN/TURN: Cloudflare Realtime TURN.
- Pagamenti: PayPal Subscriptions.
- Codice: AGPL-3.0-only.
- Marchio/logo: riservati, vedi `TRADEMARKS.md`.

## Pagine e policy presenti

- `/terms`: termini di servizio MVP.
- `/privacy`: informativa privacy MVP.
- `/community-rules`: regole community.
- `/safety`: pagina sicurezza.
- `/refunds`: cancellazioni e rimborsi.
- `LICENSE`: AGPL-3.0-only per codice sorgente.
- `TRADEMARKS.md`: marchio, logo e identita' visiva riservati.

Le pagine sono bozze operative. Prima del lancio pubblico devono essere revisionate, completate con titolare reale, contatti, giurisdizione, procedure, tempi e riferimenti specifici.

## Data map

| Categoria | Dati | Fonte | Finalita' | Conservazione da validare |
| --- | --- | --- | --- | --- |
| Utenti registrati | email, Supabase user id, conferma email | Supabase Auth | login, sicurezza, piano Premium | finche' account attivo + periodo legale |
| Profili | display name, lingua, Paese, flag 18+/regole, admin/shadowban | app/Supabase | profilo, filtri, moderazione | finche' account attivo |
| Guest | UUID locale browser | localStorage + API | limiti Free, match, report, ban | scadenza/rotazione da decidere |
| Match logs | actor id/type, canale signaling, stato, timestamp | API matchmaking | limiti, anti-rematch, audit minimo | periodo breve da definire |
| WebRTC signaling | offer/answer/ICE candidate temporanei | browser + API/Supabase | stabilire la connessione WebRTC | retention tecnica breve |
| Reports | reporter, reported, match id, reason, dettagli opzionali | utente via app | moderazione e sicurezza | periodo da definire |
| Bans | actor id/type, motivo, shadow, scadenza | admin/auto-shadowban | sicurezza e anti-abuso | durata ban + audit limitato |
| Subscription | PayPal subscription id, plan id, status, raw webhook | PayPal + webhook | abilitare Premium, contabilita' | obblighi fiscali/contrattuali |
| Video/audio | stream WebRTC non salvati | browser peer-to-peer | comunicazione live | non conservato |
| TURN credentials | username/credential temporanei | Cloudflare via `/api/ice` | fallback WebRTC | short-lived, non salvati |

## Fornitori e ruoli privacy da validare

- Vercel: hosting, serverless functions, logging tecnico.
- Supabase: Auth, Postgres e signaling temporaneo.
- Cloudflare: STUN/TURN e rete.
- PayPal: subscription e pagamenti.
- Google Analytics 4: metriche aggregate solo dopo consenso Statistiche.
- GitHub: repository pubblico AGPL.

Da validare:

- Ruolo di ciascun fornitore: processor/responsabile, independent controller o altro.
- DPA/Data Processing Addendum disponibili e applicabili.
- Trasferimenti extra UE e SCC/garanzie.
- Subprocessor list e regioni dati.
- Durata log tecnici lato provider.

## GDPR/privacy checklist

- Identificare il titolare del trattamento con nome legale, indirizzo e contatti reali.
- Definire se serve DPO/RPD o solo referente privacy.
- Definire basi giuridiche per ogni trattamento: contratto, obbligo legale, legittimo interesse, consenso dove necessario.
- Scrivere informativa privacy completa con diritti interessati, reclamo al Garante, retention, fornitori, trasferimenti extra UE.
- Creare procedura per esercizio diritti GDPR.
- Creare registro trattamenti interno.
- Definire data retention per guest, match logs, report, ban, subscription raw_json.
- Definire procedura data breach.
- Valutare DPIA per videochat 18+, moderazione, report, ban e potenziali dati sensibili emersi nei dettagli report.
- Valutare minimizzazione dei dettagli report e filtri lato UI.
- Valutare cookie/localStorage notice per guest id, Supabase session e Google Analytics 4 opzionale.
- Confermare configurazione Consent Mode, blocco preventivo GA, retention cookie/statistiche e trasferimenti dati Google.

## DSA/moderazione checklist

DevRoulotte permette comunicazione tra utenti e segnalazioni di contenuti/comportamenti. Prima del lancio pubblico va validato se e come si applicano obblighi del Digital Services Act.

- Definire punto di contatto per utenti e autorita'.
- Formalizzare notice-and-action per contenuti illegali o abuso.
- Definire tempi e workflow di gestione report.
- Definire motivazioni e comunicazioni per ban/sospensioni.
- Preparare meccanismo di reclamo interno se richiesto.
- Definire policy per contenuti illegali, minori, minacce, spam, nudita', frodi.
- Definire procedura per escalation a autorita' competenti quando necessario.
- Decidere se pubblicare transparency report periodico.

## Consumer/payments checklist

- Verificare chiarezza prezzo: 3,99 EUR/mese.
- Verificare chiarezza prova gratuita 5 giorni e rinnovo automatico.
- Verificare flusso PayPal: consenso informato prima del pagamento.
- Verificare diritto di recesso, eccezioni per servizi digitali e modalita' di cancellazione.
- Definire policy rimborso reale e contatti.
- Aggiornare `/refunds` con condizioni definitive.
- Verificare email/receipt/confirmation PayPal e pagina success/cancel.
- Verificare obblighi fiscali, IVA/VAT, fatturazione e accounting.

## 18+ e safety checklist

- Conferma 18+ oggi e' self-declaration. Validare se basta per il rischio/prodotto.
- Definire policy per sospetto minorenne.
- Definire escalation per materiale illegale o sfruttamento minori.
- Valutare se servono age assurance piu' forte o controlli aggiuntivi.
- Definire regole anti-registrazione da parte degli utenti e relative limitazioni realistiche.
- Definire canale safety/contact.
- Valutare contenuti adulti: oggi vietati dalle regole. Confermare legalmente se la sola moderazione report-based e' sufficiente per MVP privato/pubblico.

## Codice e marchio

- Confermare scelta AGPL-3.0-only per il codice.
- Confermare separazione marchio/logo/wordmark da licenza AGPL tramite `TRADEMARKS.md`.
- Valutare contributor policy e CLA/DCO se si accettano contributi esterni.
- Valutare NOTICE o headers licenza se richiesti.

## Domande da portare al consulente

1. DevRoulotte e' qualificabile come servizio di hosting/intermediario o piattaforma online ai sensi DSA?
2. Quali obblighi DSA sono applicabili a un MVP small provider?
3. La self-declaration 18+ e' sufficiente per test privato? E per lancio pubblico?
4. La moderazione senza registrare video/audio e' adeguata rispetto al rischio del prodotto?
5. Quale retention e' proporzionata per match logs, report, ban e subscription raw_json?
6. Serve DPIA prima del lancio pubblico?
7. Serve DPO/RPD?
8. Quali testi obbligatori servono per trial gratuito, rinnovo automatico, cancellazione e rimborsi?
9. Quali dati societari e contatti devono comparire in Terms/Privacy/Refunds?
10. Quale giurisdizione/foro/legge applicabile e' corretta per il titolare reale?
11. I fornitori Vercel/Supabase/Cloudflare/PayPal/Google Analytics sono configurati correttamente come processor/controller e con trasferimenti dati validi?
12. Come gestire segnalazioni di contenuti illegali, minori o minacce?

## Azioni consigliate prima del pubblico

- Sostituire tutte le bozze legali con testi revisionati.
- Inserire contatti legali reali e privacy contact.
- Inserire data retention concreta e implementarla anche nel database.
- Aggiungere pagina o email dedicata per report legali/safety.
- Documentare procedura interna admin per report, ban, escalation e data breach.
- Fare test PayPal completo con cancellazione e conferma webhook.
- Fare test video reale con due dispositivi e almeno una rete restrittiva per validare TURN.

## Riferimenti ufficiali utili

- GDPR e principi di trattamento: [Garante Privacy, principi fondamentali del trattamento](https://www.gpdp.it/home/principi-fondamentali-del-trattamento).
- Diritti privacy e reclami: [Garante Privacy, modulistica e servizi online](https://www.gpdp.it/home/modulistica-e-servizi-online).
- Digital Services Act: [Regolamento UE 2022/2065 su EUR-Lex](https://eur-lex.europa.eu/eli/reg/2022/2065/oj/eng).
- Consumer protection: [Commissione europea, unfair commercial practices directive](https://commission.europa.eu/law/law-topic/consumer-protection-law/unfair-commercial-practices-and-price-indication/unfair-commercial-practices-directive_en).
- Cloudflare Realtime TURN: [generazione credenziali temporanee](https://developers.cloudflare.com/realtime/turn/generate-credentials/).
