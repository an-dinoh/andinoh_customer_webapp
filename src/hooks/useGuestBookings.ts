'use client';

import { useSyncExternalStore } from 'react';
import { guestBookings, type SavedGuestBooking } from '@/utils/guestBookings';

const NONE: SavedGuestBooking[] = [];

/** Guest bookings saved in this browser; updates when one is added or removed. */
export function useGuestBookings(): SavedGuestBooking[] {
  return useSyncExternalStore(guestBookings.subscribe, guestBookings.list, () => NONE);
}
