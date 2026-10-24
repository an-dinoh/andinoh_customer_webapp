# Settings for running the Andinoh backend locally for the customer app's live tests (and for clicking around).
#
# Starts from the backend's own *test* settings: in-memory cache and channels, local email, fake
# Flutterwave keys, no Redis, no Cloudinary. The only change is a throwaway file database under
# LIVE_DIR, so the real DATABASE_URL in the backend's .env is never touched.
import os

from andinoh.settings.test import *  # noqa: F401,F403

LIVE_DIR = os.environ['LIVE_DIR']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(LIVE_DIR, 'live.sqlite3'),
        'OPTIONS': {'transaction_mode': 'IMMEDIATE', 'init_command': 'PRAGMA foreign_keys = OFF;'},
    }
}
MEDIA_ROOT = os.path.join(LIVE_DIR, 'media')
ALLOWED_HOSTS = ['*']
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
DEBUG = True

# Emails (staff invitations, one-time codes) are written to files the live tests read.
EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
EMAIL_FILE_PATH = os.path.join(LIVE_DIR, 'emails')

# The live suite signs in, registers and uploads far more often than a person would; lift every
# rate limit on this local server only (production limits are unchanged).
REST_FRAMEWORK = {
    **REST_FRAMEWORK,  # noqa: F405
    'DEFAULT_THROTTLE_RATES': {k: '100000/minute' for k in REST_FRAMEWORK.get('DEFAULT_THROTTLE_RATES', {})},  # noqa: F405
}

# Serve uploaded hotel and room photos at /media/ (production uses Cloudinary URLs).
ROOT_URLCONF = 'live_urls'

# Payment returns land on the local web app.
FRONTEND_URL = os.environ.get('LIVE_FRONTEND_URL', 'http://localhost:3000')

# LIVE_PAYMENTS=sandbox: real Flutterwave checkout pages in test mode, with the backend's own test keys
# (andinoh_monolith/.env). Refuses anything but test keys, so no real money can move.
if os.environ.get('LIVE_PAYMENTS') == 'sandbox':
    from dotenv import dotenv_values
    _env = dotenv_values(os.path.join(os.environ['DJANGO_MONOLITH_DIR'], '.env'))
    FLUTTERWAVE_PUBLIC_KEY = _env.get('FLUTTERWAVE_PUBLIC_KEY') or ''
    FLUTTERWAVE_SECRET_KEY = _env.get('FLUTTERWAVE_SECRET_KEY') or ''
    FLUTTERWAVE_ENCRYPTION_KEY = _env.get('FLUTTERWAVE_ENCRYPTION_KEY') or ''
    if '_TEST' not in FLUTTERWAVE_PUBLIC_KEY or '_TEST' not in FLUTTERWAVE_SECRET_KEY:
        raise RuntimeError('LIVE_PAYMENTS=sandbox needs Flutterwave TEST keys in andinoh_monolith/.env')
