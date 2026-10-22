// Points the app's API client at the local backend started by scripts/live-backend/run.sh.
process.env.NEXT_PUBLIC_API_URL = process.env.LIVE_API_URL ?? 'http://127.0.0.1:8765/api/v1';
