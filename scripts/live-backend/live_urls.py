"""The backend's own URLs, plus uploaded media served from LIVE_DIR (local runs only)."""
from django.conf import settings
from django.conf.urls.static import static

from andinoh.urls import urlpatterns as base

urlpatterns = list(base) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
