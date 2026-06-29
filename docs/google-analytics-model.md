# DevRoulotte Google Analytics 4 model

DevRoulotte usa GA4 solo dopo consenso esplicito alla categoria Statistiche del
banner cookie. Il tag Google parte con Consent Mode negato di default e gli
eventi custom vengono inviati solo se `NEXT_PUBLIC_GA_MEASUREMENT_ID` e'
configurato e l'utente ha accettato Statistiche.

## Dimensioni consigliate in GA4

Registra come dimensioni custom event-scoped:

- `surface`: area dell'interfaccia, per esempio `landing_hero`, `chat`,
  `auth_panel`, `profile`.
- `cta_id`: identificatore stabile della CTA cliccata.
- `destination`: destinazione sintetica di link esterni o sezioni interne.
- `auth_state`: `guest` oppure `logged_in`.
- `plan_tier`: `guest`, `registered`, `premium`.
- `search_reason`: `start`, `next`, `peer_left`, `webrtc_timeout`, ecc.
- `role`: ruolo WebRTC del client, `caller` o `callee`.
- `failure_reason`: motivo tecnico normalizzato.
- `report_reason`: motivo report selezionato.
- `payment_provider`: al momento `paypal`.

## Metriche/eventi principali

Funnel landing:

- `page_view`
- `cta_clicked`
- `workshop_form_opened`
- `outbound_link_clicked`
- `outbound_badge_clicked`

Funnel accesso:

- `sign_up_attempted`
- `sign_up`
- `login_attempted`
- `login`
- `logout`
- `auth_failed`
- `email_confirmed`
- `password_reset_requested`
- `password_reset_email_sent`
- `password_reset_link_confirmed`
- `password_reset_completed`

Funnel videochat:

- `age_gate_confirmed`
- `community_rules_accepted`
- `chat_start_attempted`
- `chat_start_blocked`
- `media_permission_requested`
- `media_permission_granted`
- `media_permission_failed`
- `match_search_started`
- `match_found`
- `match_search_blocked`
- `free_limit_reached`
- `webrtc_connect_started`
- `video_call_connected`
- `video_call_ended`
- `auto_next_scheduled`
- `next_clicked`
- `next_blocked`
- `stop_clicked`
- `report_submitted`
- `report_failed`

Funnel Premium:

- `premium_upgrade_clicked`
- `login_required_for_premium`
- `begin_checkout`
- `checkout_error`
- `premium_cancel_clicked`
- `premium_cancelled`
- `premium_cancel_failed`

## Conversioni consigliate

Marca come key events/conversioni:

- `sign_up`
- `email_confirmed`
- `video_call_connected`
- `report_submitted`
- `begin_checkout`
- `premium_cancelled` come evento negativo da monitorare, non conversione.

## Revenue PayPal

`begin_checkout` viene tracciato dal client con `value: 3.99`,
`currency: EUR` e `payment_provider: paypal` quando PayPal restituisce
l'approval URL.

Non tracciare `purchase` dal solo ritorno browser: un utente puo' chiudere la
pagina, annullare su PayPal o non completare l'approvazione. Per revenue
affidabile bisogna emettere l'evento solo dopo conferma webhook/server PayPal,
idealmente tramite Measurement Protocol con un evento come:

- `purchase` o `subscription_activated`
- `currency: EUR`
- `value: 3.99`
- `payment_provider: paypal`
- `subscription_period: monthly`

TODO: se viene aggiunto Measurement Protocol server-side, inserire
`GA4_API_SECRET` come variabile server-only su Vercel e non esporla mai al
client.

## Privacy

Non inviare a GA4:

- email
- id Supabase
- guest id
- match id
- PayPal subscription id
- testo libero dei report
- stack trace o messaggi utente

Gli eventi implementati usano solo categorie aggregate, durate, stato piano,
stato auth e motivi normalizzati.
