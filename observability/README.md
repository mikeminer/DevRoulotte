# DevRoulotte Elastic Observability

Questa directory aggiunge una pipeline opzionale:

```text
/api/status -> collector autenticato -> NDJSON -> Filebeat
                                               -> Elasticsearch -> Kibana
```

La pagina pubblica `/status` continua a eseguire i health check live anche se
Elastic non e' disponibile. Quando Elasticsearch e' collegato, mostra anche la
cronologia delle ultime 24 ore.

## Avvio locale

Requisiti: Docker Desktop con almeno 2 GB di memoria libera.

```powershell
Copy-Item .env.example .env
# Sostituisci COLLECTOR_SHARED_SECRET con almeno 32 caratteri casuali.
docker compose --env-file .env up -d --build
```

Endpoint locali:

- Elasticsearch: `http://127.0.0.1:9200`
- Kibana: `http://127.0.0.1:5601`
- Collector health: `http://127.0.0.1:8787/health`
- Ingest app: `http://127.0.0.1:8787/ingest/app`

Configura l'app locale:

```env
OBSERVABILITY_COLLECTOR_URL=http://127.0.0.1:8787/ingest/app
OBSERVABILITY_COLLECTOR_SECRET=lo-stesso-COLLECTOR_SHARED_SECRET
ELASTICSEARCH_URL=http://127.0.0.1:9200
ELASTICSEARCH_INDEX=devroulotte-logs-*
```

Apri `/api/status`, attendi alcuni secondi e crea in Kibana una data view
`devroulotte-logs-*` con `@timestamp` come campo temporale. I filtri principali
sono:

- `event.dataset: "devroulotte.status"`
- `status.overall.tone: "degraded"`
- `event.outcome: "failure"`

## Vercel

Filebeat non puo' girare dentro una Vercel Function e il filesystem di Vercel
non e' persistente. Il collector e lo stack Elastic devono quindi vivere su
Elastic Cloud oppure su un host persistente esterno.

Per Vercel Hobby e' sufficiente esporre il collector dietro HTTPS e impostare:

```env
OBSERVABILITY_COLLECTOR_URL=https://logs.example.com/ingest/app
OBSERVABILITY_COLLECTOR_SECRET=segreto-condiviso
ELASTICSEARCH_URL=https://elasticsearch.example.com
ELASTICSEARCH_API_KEY=api-key-con-solo-accesso-read
ELASTICSEARCH_INDEX=devroulotte-logs-*
```

L'API key usata da Vercel deve avere solo permesso `read` e `view_index_metadata`
sugli indici `devroulotte-logs-*`. Non usare l'utente amministratore.

Con Vercel Pro si puo' aggiungere anche un Log Drain NDJSON verso
`https://logs.example.com/ingest/vercel`. Salva nel collector il signing secret
come `VERCEL_DRAIN_SECRET`: il collector verifica `x-vercel-signature` sul body
originale prima di accettare gli eventi.

## Produzione

Il Compose incluso e' un ambiente single-node di sviluppo e tiene Elasticsearch
e Kibana raggiungibili soltanto da localhost. Per produzione:

1. usa HTTPS davanti al collector;
2. abilita security e TLS su Elasticsearch/Kibana o usa Elastic Cloud;
3. non pubblicare direttamente le porte `9200` e `5601`;
4. proteggi Kibana con autenticazione;
5. configura retention/ILM e backup;
6. ruota periodicamente secret e API key.

Video e audio WebRTC non entrano mai nella pipeline. Gli snapshot contengono
solo stato tecnico, latenza, ambiente e versione del deploy.
