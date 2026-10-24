#!/usr/bin/env bash
# Starts the Andinoh backend locally on a fresh, seeded throwaway database for the live tests (and for
# trying the app: API_PROXY_TARGET=http://127.0.0.1:8765 npm run dev).
#
#   scripts/live-backend/run.sh            # http://127.0.0.1:8765/api/v1
#
# Needs the backend checkout (default ../andinoh_backend/andinoh_monolith, or $ANDINOH_MONOLITH)
# with its virtualenv in venv/. Uses the backend's test settings plus a file database in .live/,
# so the backend's real DATABASE_URL is never used.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
app="$(cd "$here/../.." && pwd)"
monolith="${ANDINOH_MONOLITH:-$app/../andinoh_backend/andinoh_monolith}"
port="${LIVE_PORT:-8765}"

export LIVE_DIR="$app/.live"
export PYTHONPATH="$here:$monolith"
export DJANGO_SETTINGS_MODULE=live_settings
export DJANGO_MONOLITH_DIR="$monolith"

cd "$monolith"
# LIVE_KEEP_DATA=1 restarts on the existing database (e.g. to switch payments) instead of reseeding.
if [ -z "${LIVE_KEEP_DATA:-}" ] || [ ! -f "$LIVE_DIR/live.sqlite3" ]; then
  rm -rf "$LIVE_DIR"
  mkdir -p "$LIVE_DIR/media"
  venv/bin/python manage.py migrate --run-syncdb -v 0
  venv/bin/python manage.py shell -c "exec(open('$here/seed.py').read())"
fi
echo "Live backend on http://127.0.0.1:$port/api/v1"
exec venv/bin/python "$here/serve.py" "$port"
