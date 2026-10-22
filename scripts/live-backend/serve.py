"""Runs the local backend with the offline payment gateway installed. Usage: serve.py <port>"""
import sys

import django

django.setup()

import fake_gateway  # noqa: E402  (scripts/live-backend is on PYTHONPATH)
from django.core.management import call_command  # noqa: E402

fake_gateway.install()
call_command('runserver', f'127.0.0.1:{sys.argv[1]}', use_reloader=False)
