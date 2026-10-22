"""
Seeds the throwaway live database with what a traveller sees: places, help content, airports, four live
hotels with photos, rooms, add-ons, discounts and an event venue, and one customer with a trip in every
state (upcoming and paid, checked in with a hotel chat, checked out, awaiting payment).

Everything goes through the backend's real API in-process (DRF's APIClient), with Flutterwave replaced by
the offline stand-in. Writes the ids the live tests need to $LIVE_DIR/seed.json.

Run with: manage.py shell -c "exec(open('scripts/live-backend/seed.py').read())"  (see run.sh)
"""
import json
import os
import subprocess
from datetime import date, timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from apps.auth.models import User, Profile
from apps.hotels.models import Hotel, HotelImage
from apps.shared.models import City, State
from apps.shared.tests.api_examples.world import places, user, content, pay_online, gateway_confirms

import fake_gateway  # scripts/live-backend: Flutterwave stays offline

fake_gateway.install()

PASSWORD = 'Sunny@Lagos2026'
CUSTOMER = 'ada@traveller.test'
PHOTOS = os.path.join(os.path.dirname(os.environ['DJANGO_MONOLITH_DIR']), 'unsplash')
LIVE_DIR = os.environ['LIVE_DIR']


def day(n):
    return (date.today() + timedelta(days=n)).isoformat()


def as_user(account):
    c = APIClient()
    c.force_authenticate(account)
    return c


def ok(response, *codes):
    codes = codes or (200, 201)
    assert response.status_code in codes, (response.status_code, getattr(response, 'data', response.content))
    return response.data


def photo(name):
    """A 1400px copy of one of the backend's Unsplash photos (the originals are several MB)."""
    src = os.path.join(PHOTOS, name)
    out = os.path.join(LIVE_DIR, f'small-{name}')
    if not os.path.exists(out):
        try:
            subprocess.run(['sips', '-Z', '1400', src, '--out', out], check=True, capture_output=True)
        except (OSError, subprocess.CalledProcessError):
            out = src
    with open(out, 'rb') as fh:
        return SimpleUploadedFile(name, fh.read(), content_type='image/jpeg')


# --- places, content, airports ---------------------------------------------------------------------
country, lagos, ikeja = places()
lekki = City.objects.create(name='Lekki', state=lagos)
vi = City.objects.create(name='Victoria Island', state=lagos)
fct = State.objects.create(name='FCT', country=country)
abuja = City.objects.create(name='Abuja', state=fct, is_capital=True)
content()

from apps.support.models import ArticleCategory, Article  # noqa: E402
stays = ArticleCategory.objects.create(title='Bookings and payments', slug='bookings-payments', icon='calendar',
                                       description='Paying, changing and cancelling stays', order=0)
Article.objects.create(category=stays, title='How do refunds work?', slug='how-do-refunds-work', tags='refund,cancel',
                       body='Refunds follow the hotel’s cancellation policy, shown before you book.\n\n'
                            '- **Flexible:** full refund up to 7 days before check-in\n- **Strict:** full refund up to 14 days before\n\n'
                            'Refunds go back to the card or account you paid with.')
Article.objects.create(category=stays, title='Can I pay at the hotel?', slug='pay-at-the-hotel', tags='pay,cash',
                       body='Some hotels let you pay the rest at the property. You pay a deposit and the service fee online to hold the room.')

from apps.customers.models import PickupLocation  # noqa: E402
airport = PickupLocation.objects.create(
    name='Murtala Muhammed International Airport', location_type='AIRPORT', address='Ikeja, Lagos',
    latitude='6.577400', longitude='3.321200', pickup_fee='5000.00', terminal='International')
PickupLocation.objects.create(
    name='Nnamdi Azikiwe International Airport', location_type='AIRPORT', address='Abuja, FCT',
    latitude='9.006800', longitude='7.263200', pickup_fee='5000.00', terminal='Main')


# --- hotels ------------------------------------------------------------------------------------------
def hotel(owner_email, name, city, state, *, hotel_type, stars, lat, lng, address, policy, photos, rooms, services=(), discount=None):
    ok(APIClient().post('/api/v1/auth/register/', {
        'email': owner_email, 'password': PASSWORD, 'full_name': f'{name} Owner', 'phone_number': '+2348031234567',
        'role': 'hotel', 'hotel_name': name}, format='json'), 201)
    owner_user = User.objects.get(email=owner_email)
    Profile.objects.filter(user=owner_user).update(is_verified=True)
    owner = as_user(owner_user)
    ok(owner.patch('/api/v1/hotels/my-hotel/', {
        'name': name, 'description': f'{name} in {city.name}: calm rooms, friendly staff and a short ride to everything.',
        'hotel_type': hotel_type, 'star_rating': stars, 'address': address,
        'country': str(country.id), 'state': str(state.id), 'city': str(city.id), 'latitude': lat, 'longitude': lng,
        'phone': '+2348031234567', 'email': owner_email, 'check_in_time': '14:00', 'check_out_time': '11:00',
        'legal_name': f'{name} Ltd', 'registration_number': 'RC1234567', 'tax_id': 'TIN-1234', 'contact_person': 'Front desk',
        'contact_phone': '+2348031234567', 'total_rooms': 40}, format='json'))
    h = Hotel.objects.get(owner_id=owner_user.profile.id)
    Hotel.objects.filter(pk=h.pk).update(kyc_status='verified', is_active=True, is_verified=True)
    ok(owner.patch('/api/v1/hotels/my-hotel/policies/', policy, format='json'))
    ok(owner.post('/api/v1/hotels/my-hotel/taxes/', {'tax_name': 'VAT', 'percentage_rate': '7.50', 'is_mandatory': True}, format='json'), 201)
    for i, name_ in enumerate(photos):
        ok(owner.post('/api/v1/hotels/upload-image/', {'image': photo(name_), 'image_type': 'exterior' if i == 0 else 'lobby',
                                                       'caption': '', 'is_primary': i == 0, 'order': i}, format='multipart'), 201)
    HotelImage.objects.filter(hotel=h).update(status='approved')
    made = []
    for r in rooms:
        units = r.pop('units')
        room = ok(owner.post('/api/v1/hotels/rooms/', r, format='json'), 201)
        for n in range(units):
            ok(owner.post(f"/api/v1/hotels/rooms/{room['id']}/physical-rooms/", {'room_number': f"{r['title'][0]}{101 + n}", 'bed_type': r['bed_type']}, format='json'), 201)
        made.append(room)
    svc = [ok(owner.post('/api/v1/hotels/services/', s, format='json'), 201) for s in services]
    if discount:
        ok(owner.post('/api/v1/hotels/discounts/', {'title': discount, 'discount_type': 'percent', 'value': '15',
                                                   'start_date': day(0), 'end_date': day(90)}, format='json'), 201)
    return owner_user, owner, h, made, svc


palm_owner_user, palm_owner, palm, (deluxe, suite), (spa, transfer, breakfast) = hotel(
    'owner@palmview.test', 'Palmview Resort & Spa', lekki, lagos, hotel_type='resort', stars=4, lat='6.442500', lng='3.471100',
    address='12 Admiralty Way, Lekki Phase 1',
    policy={'allows_pay_at_hotel': True, 'deposit_required_pct': '20.00', 'cancellation_type': 'flexible'},
    photos=['bilderboken-rlwE8f8anOc-unsplash.jpg', 'llxvisuals-ucWKpZ264Rs-unsplash.jpg', 'valeriia-bugaiova-_pPHgeHz1uk-unsplash.jpg'],
    rooms=[
        {'room_type': 'deluxe', 'title': 'Deluxe Lagoon View', 'description': 'King bed, lagoon view, rain shower.', 'room_size': 38,
         'bed_type': 'king', 'max_occupancy': 3, 'max_adults': 2, 'max_children': 1, 'base_price': '55000.00', 'units': 4},
        {'room_type': 'suite', 'title': 'Executive Suite', 'description': 'Separate lounge, bathtub and a work desk.', 'room_size': 64,
         'bed_type': 'king', 'max_occupancy': 4, 'max_adults': 2, 'max_children': 2, 'base_price': '120000.00', 'units': 2},
    ],
    services=[
        {'service_type': 'SPA', 'name': 'Deep Tissue Massage', 'description': '60 minutes', 'price': '25000.00'},
        {'service_type': 'AIRPORT_PICKUP', 'name': 'Airport transfer', 'description': 'From Lagos airport', 'price': '15000.00'},
        {'service_type': 'DINING', 'name': 'Breakfast for two', 'description': 'Buffet, 7–10 am', 'price': '8500.00'},
    ],
    discount='Lagoon Escape 15% off')
_, eko_owner, eko, (eko_standard,), _ = hotel(
    'owner@ekobusiness.test', 'Eko Business Hotel', vi, lagos, hotel_type='business', stars=5, lat='6.428100', lng='3.421900',
    address='4 Ozumba Mbadiwe Avenue', policy={'allows_pay_at_hotel': False, 'deposit_required_pct': '0.00', 'cancellation_type': 'strict'},
    photos=['willian-justen-de-vasconcellos-4uPDyJ8AAS4-unsplash.jpg', 'alejandro-barba-MXkEYPnOyiM-unsplash.jpg'],
    rooms=[{'room_type': 'standard', 'title': 'Business King', 'description': 'Fast Wi-Fi and a desk with a view.', 'room_size': 30,
            'bed_type': 'king', 'max_occupancy': 2, 'max_adults': 2, 'max_children': 0, 'base_price': '42000.00', 'units': 3}])
_, _, aso, (garden,), _ = hotel(
    'owner@asogarden.test', 'Aso Garden Suites', abuja, fct, hotel_type='boutique', stars=4, lat='9.057900', lng='7.495100',
    address='17 Aguiyi Ironsi Street, Maitama', policy={'allows_pay_at_hotel': True, 'deposit_required_pct': '30.00', 'cancellation_type': 'flexible'},
    photos=['oswald-elsaboath-ym_EI-DTS1g-unsplash.jpg'],
    rooms=[{'room_type': 'double', 'title': 'Garden King', 'description': 'Opens onto the garden.', 'room_size': 34,
            'bed_type': 'king', 'max_occupancy': 3, 'max_adults': 2, 'max_children': 1, 'base_price': '68000.00', 'units': 3}])
_, _, inn, _, _ = hotel(
    'owner@ikejainn.test', 'Ikeja Budget Inn', ikeja, lagos, hotel_type='budget', stars=2, lat='6.601800', lng='3.351500',
    address='22 Allen Avenue', policy={'allows_pay_at_hotel': True, 'deposit_required_pct': '0.00', 'cancellation_type': 'non_refundable'},
    photos=['linus-mimietz-p3UWyaujtQo-unsplash.jpg'],
    rooms=[{'room_type': 'single', 'title': 'Cosy Single', 'description': 'Clean and quiet, near the airport.', 'room_size': 16,
            'bed_type': 'single', 'max_occupancy': 1, 'max_adults': 1, 'max_children': 0, 'base_price': '18000.00', 'units': 5}])

# Palmview's event venue and front-desk staff (for tips).
hall = ok(palm_owner.post('/api/v1/hotels/event-spaces/', {
    'name': 'Lagoon Ballroom', 'description': 'Pillar-free hall with lagoon views.',
    'supported_setups': [{'style': 'theatre', 'max_capacity': 400}, {'style': 'banquet', 'max_capacity': 250}],
    'base_price_per_hour': '75000.00', 'base_price_per_day': '500000.00'}, format='json'), 201)
catering = ok(palm_owner.post('/api/v1/hotels/event-services/', {
    'name': 'Buffet catering', 'price': '9500.00', 'billing_type': 'per_person'}, format='json'), 201)
desk_role = ok(palm_owner.post('/api/v1/hotels/roles/', {'name': 'Front Desk', 'permissions': ['manage_bookings', 'chat_guests']}, format='json'), 201)
staff = ok(palm_owner.post('/api/v1/hotels/staff/', {'email': 'sarah@palmview.test', 'full_name': 'Sarah Bello', 'employee_id': 'STF-0042',
                                                     'role_id': desk_role['id'], 'department': 'front_office'}, format='json'), 201)
from apps.hotels.models import HotelStaff  # noqa: E402
HotelStaff.objects.filter(pk=staff['id']).update(invitation_status='active', is_active=True)

# --- the traveller ----------------------------------------------------------------------------------
ok(APIClient().post('/api/v1/auth/register/', {
    'email': CUSTOMER, 'password': PASSWORD, 'full_name': 'Ada Okafor', 'phone_number': '+2348031110000',
    'device_name': 'Seed', 'platform': 'web'}, format='json'), 201)
ada_user = User.objects.get(email=CUSTOMER)
Profile.objects.filter(user=ada_user).update(is_verified=True)
ada = as_user(ada_user)


def book(hotel_, room, check_in, nights, services=(), pay=True):
    b = ok(ada.post('/api/v1/customers/bookings/create/', {
        'hotel_id': str(hotel_.id), 'check_in_date': day(check_in), 'check_out_date': day(check_in + nights), 'adults': 2,
        'rooms': [{'room_id': room['id'], 'quantity': 1}], 'payment_method': 'online',
        'services': [{'offering_id': s['id'], 'quantity': 1} for s in services]}, format='json'), 201)
    if pay:
        pay_online(ada, f"/api/v1/bookings/{b['id']}/pay/", f"/api/v1/bookings/{b['id']}/verify-payment/", CUSTOMER)
    return b


upcoming = book(palm, deluxe, 10, 2, services=[spa])
in_house = book(palm, suite, 0, 3)
with gateway_confirms():
    ok(palm_owner.post(f"/api/v1/hotels/bookings/{in_house['id']}/check-in/", {}, format='json'))
chat = ok(ada.post('/api/v1/customers/chats/', {'booking_id': in_house['id'], 'subject': 'Late breakfast',
                                                 'initial_message': 'Hello! Could breakfast be served in the room at 10?'}, format='json'), 201)
ok(as_user(palm_owner_user).post(f"/api/v1/hotels/chats/{chat['id']}/messages/", {'message': 'Of course! We’ll bring it up at 10. Enjoy your stay.'}, format='json'), 201)

finished = book(eko, eko_standard, 0, 1)
with gateway_confirms():
    ok(eko_owner.post(f"/api/v1/hotels/bookings/{finished['id']}/check-in/", {}, format='json'))
    ok(eko_owner.post(f"/api/v1/hotels/bookings/{finished['id']}/check-out/", {}, format='json'))

awaiting = book(aso, garden, 20, 1, pay=False)

# Another guest's review, so ratings show on the hotel pages.
reviewer_user = user('tunde@guest.test', 'customer', 'Tunde Bakare')
reviewer = as_user(reviewer_user)
rb = ok(reviewer.post('/api/v1/customers/bookings/create/', {
    'hotel_id': str(palm.id), 'check_in_date': day(0), 'check_out_date': day(1), 'adults': 1,
    'rooms': [{'room_id': deluxe['id'], 'quantity': 1}], 'payment_method': 'online'}, format='json'), 201)
pay_online(reviewer, f"/api/v1/bookings/{rb['id']}/pay/", f"/api/v1/bookings/{rb['id']}/verify-payment/", 'tunde@guest.test')
with gateway_confirms():
    ok(palm_owner.post(f"/api/v1/hotels/bookings/{rb['id']}/check-in/", {}, format='json'))
    ok(palm_owner.post(f"/api/v1/hotels/bookings/{rb['id']}/check-out/", {}, format='json'))
ok(reviewer.post('/api/v1/customers/reviews/', {
    'booking_id': rb['id'], 'overall_rating': 5, 'cleanliness_rating': 5, 'service_rating': 5, 'location_rating': 4,
    'value_rating': 4, 'amenities_rating': 5, 'title': 'Lovely lagoon views',
    'review_text': 'Friendly staff, spotless room and the best breakfast in Lekki. We will be back.', 'trip_type': 'leisure',
    'traveled_with': 'partner'}, format='json'), 201)

seed = {
    'password': PASSWORD, 'customer_email': CUSTOMER, 'owner_email': 'owner@palmview.test',
    'palmview_id': str(palm.id), 'eko_id': str(eko.id), 'aso_id': str(aso.id), 'inn_id': str(inn.id),
    'deluxe_id': deluxe['id'], 'suite_id': suite['id'], 'eko_room_id': eko_standard['id'], 'garden_id': garden['id'],
    'spa_id': spa['id'], 'breakfast_id': breakfast['id'],
    'upcoming_booking_id': upcoming['id'], 'in_house_booking_id': in_house['id'], 'finished_booking_id': finished['id'],
    'awaiting_booking_id': awaiting['id'], 'chat_id': chat['id'], 'staff_id': staff['id'],
    'hall_id': hall['id'], 'catering_id': catering['id'], 'airport_id': airport.id,
    'lagos_state_id': str(lagos.id), 'lekki_city_id': str(lekki.id), 'abuja_city_id': str(abuja.id),
}
with open(os.path.join(LIVE_DIR, 'seed.json'), 'w') as fh:
    json.dump(seed, fh, indent=2)
print('Seeded', json.dumps(seed))
