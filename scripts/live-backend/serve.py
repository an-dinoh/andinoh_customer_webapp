"""
Runs the local backend. Usage: serve.py <port>

Payments use the offline stand-in (every checkout succeeds at once) unless LIVE_PAYMENTS=sandbox, which
uses Flutterwave's real test-mode checkout (see live_settings.py).
"""
import os
import sys

import django

django.setup()

from django.core.management import call_command  # noqa: E402

if os.environ.get('LIVE_PAYMENTS') == 'sandbox':
    print('Payments: Flutterwave sandbox (test keys; use Flutterwave test cards)')
else:
    import fake_gateway  # noqa: E402  (scripts/live-backend is on PYTHONPATH)
    fake_gateway.install()
    print('Payments: offline stand-in (checkout succeeds at once)')
call_command('runserver', f'127.0.0.1:{sys.argv[1]}', use_reloader=False)
