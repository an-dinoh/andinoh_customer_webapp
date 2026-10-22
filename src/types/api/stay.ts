import type { DateString, DateTime, Money, PageParams, UUID } from './common';
import type { PaymentStart } from './bookings';

// Customer guide 10 (chat, tips, pickups, complaints) and 12 (notifications).

// ---- chat (10.1) -----------------------------------------------------------------------------------

export type ChatStatus = 'active' | 'closed' | 'archived';
export type SenderType = 'customer' | 'staff' | 'system';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'file' | 'location' | 'system';

export interface ReplyPreview {
  id: UUID;
  sender_type: SenderType;
  sender_name: string;
  message_type: MessageType | string;
  message: string;
  preview_url: string;
  is_deleted: boolean;
}

export interface ChatMessage {
  id: UUID;
  chat: UUID;
  chat_id?: UUID;
  sender_type: SenderType | string;
  sender_type_display?: string;
  sender_id: UUID | null;
  sender_name: string;
  message_type: MessageType | string;
  message: string;
  media_url: string;
  /** Resized image or video poster; "" for audio and other files. */
  preview_url?: string;
  media_name?: string;
  media_size?: number | null;
  media_content_type?: string;
  media_duration?: number | null;
  attachment_url: string;
  attachment_type: string;
  reply_to?: ReplyPreview | null;
  is_edited?: boolean;
  edited_at?: DateTime | null;
  is_deleted?: boolean;
  deleted_at?: DateTime | null;
  status: string;
  is_read: boolean;
  read_at: DateTime | null;
  created_at: DateTime;
}

export interface Chat {
  id: UUID;
  customer: UUID;
  booking: UUID;
  hotel_id: UUID;
  hotel_name: string;
  status: ChatStatus | string;
  status_display: string;
  subject: string;
  assigned_staff_id: UUID | null;
  assigned_staff_name: string;
  last_message_at: DateTime | null;
  last_message_by: SenderType | string | null;
  unread_count: number;
  messages: ChatMessage[];
  created_at: DateTime;
  updated_at: DateTime;
  closed_at: DateTime | null;
}

export interface ChatStart { booking_id: UUID; subject?: string; initial_message: string }

/** POST …/messages/ answers with the saved fields only. */
export interface SentMessage extends Partial<ChatMessage> {
  message: string;
  message_type: string;
}

export interface SendMessage {
  message: string;
  reply_to_id?: UUID;
  message_type?: MessageType;
  media_url?: string;
}

export interface SendMedia {
  file: File | Blob;
  message?: string;
  reply_to_id?: UUID;
  /** Seconds, for voice notes and videos. */
  duration?: number;
}

/** A file already on Cloudinary (big videos), sent as JSON to …/media/. */
export interface SendUploaded {
  cloudinary_public_id: string;
  resource_type: string;
  file_name: string;
  message?: string;
  reply_to_id?: UUID;
  duration?: number;
}

export interface UploadTicket {
  upload_url: string;
  fields: Record<string, string>;
  public_id: string;
  expires_at: DateTime;
  max_bytes: Record<'image' | 'video' | 'audio' | 'document' | 'file', number>;
}

export interface Upload { url: string; kind: string; content_type: string; size: number; name: string }

// ---- tips (10.2) -----------------------------------------------------------------------------------

export interface TipStaff { id: UUID; full_name: string; role: string; department: string }

export interface TipStaffList {
  booking: { id: UUID; hotel_id: UUID; hotel_name: string; check_in_date: DateString; check_out_date: DateString };
  staff: TipStaff[];
}

export type TipPaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Tip {
  id: UUID;
  customer: UUID;
  booking: UUID;
  staff_id: UUID;
  staff_name: string;
  staff_role: string;
  hotel_id: UUID;
  hotel_name: string;
  amount: Money;
  currency: string;
  message: string;
  payment_status: TipPaymentStatus | string;
  payment_status_display: string;
  payment_method: string;
  payment_transaction_id: string;
  created_at: DateTime;
  paid_at: DateTime | null;
  charged_to_room: boolean;
}

export interface TipInput { booking_id: UUID; staff_id: UUID; amount: string; message?: string; charge_to_room?: boolean; redirect_url?: string }

export interface TipCreated {
  tip: Tip;
  payment: PaymentStart | null;
  charged_to_room: boolean;
  message?: string;
}

export interface TipVerifyResult { status: string; message?: string; tip?: Tip }
export interface TipStats { total_tips: number; total_amount: number; currency: string }

// ---- pickups (10.3) --------------------------------------------------------------------------------

export type VehicleType = 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY' | 'BUS';
export type PickupStatus = 'PENDING' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PickupLocationType = 'AIRPORT' | 'TRAIN_STATION' | 'BUS_STATION' | 'HOTEL' | 'RESTAURANT' | 'SHOPPING_MALL' | 'TOURIST_SPOT' | 'CUSTOM';

export interface PickupLocation {
  id: number;
  name: string;
  location_type: PickupLocationType | string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  pickup_fee: Money;
  terminal: string;
  gate: string;
  is_active: boolean;
}

export interface PickupEstimateQuery {
  pickup_location_id?: number;
  destination_address: string;
  vehicle_type?: VehicleType;
  luggage_count?: number;
  passenger_count?: number;
  special_requirements?: string;
  booking_id?: UUID;
}

export interface PickupEstimate {
  vehicle_type?: string;
  passenger_count?: number;
  luggage_count?: number;
  estimated_base_fare: Money;
  estimated_additional_charges: Money;
  estimated_total_fare: Money;
  estimated_duration_minutes: number | null;
  distance_km: Money | null;
  is_precise: boolean;
  note: string | null;
}

export interface PickupInput {
  pickup_location_id?: number;
  custom_pickup_address?: string;
  destination_address: string;
  pickup_date: DateString;
  pickup_time: string;
  passenger_count: number;
  luggage_count: number;
  vehicle_type: VehicleType;
  flight_number?: string;
  airline?: string;
  special_requirements?: string;
  booking_id?: UUID;
}

export type PickupUpdate = Partial<Pick<PickupInput, 'passenger_count' | 'luggage_count' | 'special_requirements' | 'flight_number' | 'airline'>> & { arrival_time?: string };

export interface Pickup {
  id: number;
  customer_name: string;
  booking: UUID | null;
  pickup_location: number | null;
  pickup_location_name: string;
  custom_pickup_address: string;
  destination_address: string;
  destination_latitude: string | null;
  destination_longitude: string | null;
  pickup_date: DateString;
  pickup_time: string;
  estimated_duration: number | null;
  passenger_count: number;
  luggage_count: number;
  special_requirements: string;
  vehicle_type: VehicleType | string;
  vehicle_type_display: string;
  base_fare: Money;
  additional_charges: Money;
  total_fare: Money;
  driver_name: string;
  driver_phone: string;
  vehicle_details: string;
  license_plate: string;
  status: PickupStatus | string;
  status_display: string;
  confirmation_code: string;
  flight_number: string;
  airline: string;
  arrival_time: string | null;
  confirmed_at: DateTime | null;
  driver_assigned_at: DateTime | null;
  picked_up_at: DateTime | null;
  completed_at: DateTime | null;
  cancelled_at: DateTime | null;
  cancellation_reason: string;
  cancellation_fee: Money | null;
  customer_rating: number | null;
  customer_feedback: string;
  driver_rating: number | null;
  driver_feedback: string;
  created_at: DateTime;
  updated_at: DateTime;
  payment_status: 'unpaid' | 'pending' | 'paid' | 'refund_pending' | 'refunded' | 'partially_refunded' | string;
  amount_paid: Money;
  currency: string;
  paid_at: DateTime | null;
  refunded_amount: Money;
}

export type PickupBrief = Pick<Pickup, 'id' | 'confirmation_code' | 'pickup_location_name' | 'destination_address' | 'pickup_date' |
  'pickup_time' | 'total_fare' | 'status' | 'status_display' | 'created_at'>;

export interface PickupSummary {
  statistics: { total_requests: number; total_spent: number; completed_requests: number; cancelled_requests: number; average_rating: number };
  recent_pickups: PickupBrief[];
  upcoming_pickups: PickupBrief[];
}

export interface PickupResult { message?: string; status?: string; pickup_request: Pickup }

// ---- complaints (10.4) -----------------------------------------------------------------------------

export type ComplaintType = 'BOOKING' | 'ROOM' | 'SERVICE' | 'STAFF' | 'CLEANLINESS' | 'NOISE' | 'AMENITIES' | 'BILLING' | 'PICKUP' | 'WEBSITE' | 'REFUND' | 'OTHER';
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ComplaintInput {
  booking_id?: UUID;
  complaint_type: ComplaintType;
  subject: string;
  description: string;
  priority?: ComplaintPriority;
  incident_date?: DateString;
  incident_location?: string;
  attachments?: string[];
}

export interface ComplaintResponse {
  id: number;
  responder_name: string;
  responder_role: string;
  message: string;
  is_internal_note: boolean;
  attachment: string | null;
  created_at: DateTime;
}

export interface Complaint {
  id: number;
  complaint_id: string;
  customer: UUID;
  booking: UUID | null;
  complaint_type: ComplaintType | string;
  complaint_type_display: string;
  subject: string;
  description: string;
  hotel_id: UUID | null;
  hotel_name: string;
  room_number: string;
  incident_date: DateString | null;
  incident_location: string;
  priority: ComplaintPriority | string;
  priority_display: string;
  status: ComplaintStatus | string;
  status_display: string;
  resolution_description: string;
  compensation_offered: string;
  compensation_amount: Money | null;
  is_customer_satisfied: boolean | null;
  customer_rating: number | null;
  customer_feedback: string;
  attachments: string[];
  responses: ComplaintResponse[];
  created_at: DateTime;
  updated_at: DateTime;
  resolved_at: DateTime | null;
  closed_at: DateTime | null;
  [key: string]: unknown;
}

export type ComplaintCreated = Pick<Complaint, 'id' | 'complaint_id' | 'complaint_type' | 'subject' | 'description' | 'hotel_id' |
  'hotel_name' | 'room_number' | 'incident_date' | 'incident_location' | 'attachments'>;

export interface ComplaintStats {
  total_complaints: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  by_type: Record<string, number>;
}

// ---- notifications (12) ----------------------------------------------------------------------------

export interface CustomerNotification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  delivery_channel: string;
  reference_id: string | null;
  reference_type: 'booking' | 'chat' | 'pickup' | string | null;
  metadata: Record<string, unknown>;
  created_at: DateTime;
}

export interface NotificationQuery extends PageParams {
  ordering?: '-created_at' | 'created_at';
}
