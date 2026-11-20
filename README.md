# News Mercati

Dashboard PWA del report giornaliero mercati (azionario, tech, energia, crypto).
Tema scuro “Night Trading”, navigazione a schermate, installabile sulla Home del telefono.

**URL pubblico:** https://nikfuz.github.io/news-mercati/

## Installarla sul telefono

1. Apri il link **nel browser** (Safari su iPhone, Chrome su Android), non nell’app Grok.
2. **iPhone (Safari):** tocca Condividi (il quadrato con la freccia) → **Aggiungi alla schermata Home**.
3. **Android (Chrome):** tocca i tre puntini → **Aggiungi a schermata Home** (oppure **Installa app**).

Il link non cambia: l’icona apre sempre la versione aggiornata.

## Aggiornare il report ogni mattina

I dati del giorno stanno solo in `data.json`. Lo stile e i componenti non vanno toccati.

1. Sostituisci `/home/box/shared/news-mercati-webapp/data.json` con il report nuovo, **stessa forma dei campi** (dateLabel, updatedAt, headlines, kpis, indexMoves, italianMovers, etfFlows, punZones, news, rumors, agenda, homeTiles, sectors).
2. In `sectors` aggiorna lead, kpiLabels e i grafici (source, labels, heading, caption, kind, emphasis) se cambiano rispetto al giorno prima.
3. Pubblica:

```bash
cd /home/box/shared/news-mercati-webapp
./deploy.sh --data-only
```

Per validare il JSON senza pubblicare: `./deploy.sh --check`.
Se hai cambiato anche HTML, CSS, JS o icone: `./deploy.sh`.

GitHub Pages impiega in genere 1-2 minuti a rendere visibile l’aggiornamento.
