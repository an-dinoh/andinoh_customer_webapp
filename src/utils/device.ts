import type { DeviceInfo } from '@/types/api';

/**
 * What this browser is, for the "signed-in devices" list (Customer guide 3.1): browser and system, e.g.
 * "Chrome on macOS", plus the OS version where the browser says it.
 */
export function deviceInfo(): DeviceInfo {
  if (typeof navigator === 'undefined') return { platform: 'web', device_name: 'Web browser' };
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'web';
  const version =
    /Android ([\d.]+)/.exec(ua)?.[1] ??
    /OS (\d+[_\d]*) like Mac OS X/.exec(ua)?.[1]?.replace(/_/g, '.') ??
    /Mac OS X (\d+[_.\d]*)/.exec(ua)?.[1]?.replace(/_/g, '.') ??
    /Windows NT ([\d.]+)/.exec(ua)?.[1];
  return {
    platform: 'web',
    device_name: `${browser} on ${os}`.slice(0, 200),
    ...(version ? { os_version: `${os} ${version}`.slice(0, 50) } : {}),
    app_version: `web ${process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0'}`.slice(0, 50),
  };
}

/** The browser's location with the person's permission; null if they say no or it takes too long. */
export function currentLocation(timeout = 8000): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null);
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      p => resolve({ latitude: Number(p.coords.latitude.toFixed(6)), longitude: Number(p.coords.longitude.toFixed(6)) }),
      () => resolve(null),
      { timeout, maximumAge: 10 * 60_000 },
    );
  });
}
