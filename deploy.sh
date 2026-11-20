#!/usr/bin/env bash
# Aggiorna e ripubblica la dashboard News Mercati su GitHub Pages.
# Uso:
#   ./deploy.sh              # valida data.json, committa tutte le modifiche e pubblica
#   ./deploy.sh --data-only  # pubblica solo data.json (report del giorno)
#   ./deploy.sh --check      # valida data.json senza pubblicare
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

python3 - <<'PY'
import json, sys
from pathlib import Path

p = Path("data.json")
if not p.exists():
    sys.exit("Manca data.json")
try:
    data = json.loads(p.read_text(encoding="utf-8"))
except json.JSONDecodeError as exc:
    sys.exit(f"data.json non è un JSON valido: {exc}")

required = [
    "dateLabel", "updatedAt", "timezone", "headlines",
    "kpis", "news", "rumors", "agenda", "sectors", "homeTiles",
]
missing = [key for key in required if key not in data]
if missing:
    sys.exit("data.json manca i campi: " + ", ".join(missing))
if not data["kpis"] or not data["headlines"]:
    sys.exit("data.json: kpis e headlines non possono essere vuoti")
for kpi in data["kpis"]:
    for field in ("label", "value", "changePct", "changeLabel", "detail"):
        if field not in kpi:
            sys.exit(f"KPI incompleto ({kpi.get('label', '?')}): manca {field}")
print(
    f"data.json OK — {data['dateLabel']}, "
    f"aggiornato alle {data['updatedAt']} {data['timezone']}, "
    f"{len(data['news'])} notizie, {len(data['kpis'])} KPI"
)
PY

if [[ "${1:-}" == "--check" ]]; then
  exit 0
fi

if [[ ! -d .git ]]; then
  echo "Repository git non inizializzato in $ROOT." >&2
  exit 1
fi

if [[ -z "$(git config user.email || true)" ]]; then
  git config user.email "22688539+nikfuz@users.noreply.github.com"
  git config user.name "nikfuz"
fi

if [[ "${1:-}" == "--data-only" ]]; then
  git add data.json
else
  git add -A
fi

if git diff --cached --quiet; then
  echo "Nessuna modifica da pubblicare."
  exit 0
fi

DATE="$(python3 -c "import json; print(json.load(open('data.json', encoding='utf-8')).get('dateLabel', 'report'))")"
git commit -m "Aggiorna report: ${DATE}"
git push origin HEAD

echo
echo "Pubblicato. GitHub Pages di solito è aggiornato entro 1-2 minuti:"
echo "https://nikfuz.github.io/news-mercati/"
