// One module per section of the Customer App guide (andinoh_monolith/docs/customer-app/CUSTOMER_APP_GUIDE.md)
// and the shared guide. Each method is one endpoint, named for what it does.
export { authApi } from './auth';
export { appApi, helpApi, legalApi, locationsApi, currencyApi, platformNotificationsApi } from './content';
export { hotelsApi, recentSearchesApi, adsApi } from './hotels';
export { bookingsApi, receiptsApi, guestBookingsApi } from './bookings';
export { chatApi, uploadsApi, tipsApi, pickupsApi, complaintsApi } from './stay';
export { profileApi, notificationsApi, devicesApi, reviewsApi, referralsApi, statementApi } from './account';
export { flightsApi, eventsApi } from './travel';
