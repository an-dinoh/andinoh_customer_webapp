import { apiClient } from '@/utils/api';
import type {
  Chat, ChatMessage, ChatStart, Complaint, ComplaintCreated, ComplaintInput, ComplaintResponse, ComplaintStats, MessageResponse,
  PageParams, Paginated, PaymentStart, Pickup, PickupBrief, PickupEstimate, PickupEstimateQuery, PickupInput, PickupLocation,
  PickupResult, PickupSummary, PickupUpdate, SendMedia, SendMessage, SendUploaded, SentMessage, Tip, TipCreated, TipInput,
  TipStaffList, TipStats, TipVerifyResult, Upload, UploadTicket, UUID, VerifyIds,
} from '@/types/api';

// Customer guide 10: during the stay. All of it needs an account.

export const chatApi = {
  /** Only while checked in (and paid, or pay at hotel); one active chat per booking. */
  start: (body: ChatStart) => apiClient.post<{ id: UUID; subject: string }>('/customers/chats/', body),
  list: (params?: PageParams) => apiClient.get<Paginated<Chat>>('/customers/chats/', params),
  get: (chatId: UUID) => apiClient.get<Chat>(`/customers/chats/${chatId}/`),
  /** Oldest first. */
  messages: (chatId: UUID, params?: PageParams) => apiClient.get<Paginated<ChatMessage>>(`/customers/chats/${chatId}/messages/`, params),
  send: (chatId: UUID, body: SendMessage) => apiClient.post<SentMessage>(`/customers/chats/${chatId}/messages/`, body),
  /** One request uploads and sends any file (images 10 MB … videos 100 MB). */
  sendFile: (chatId: UUID, media: SendMedia, onProgress?: (fraction: number) => void) =>
    apiClient.upload<ChatMessage>(`/customers/chats/${chatId}/media/`, { ...media }, 'post', onProgress),
  /** Big files go straight to Cloudinary first (uploadTicket), then this sends the message. */
  sendUploaded: (chatId: UUID, body: SendUploaded) => apiClient.post<ChatMessage>(`/customers/chats/${chatId}/media/`, body),
  uploadTicket: (chatId: UUID) => apiClient.post<UploadTicket>(`/customers/chats/${chatId}/media/upload-url/`),
  /** My own messages, within 15 minutes. */
  edit: (chatId: UUID, messageId: UUID, message: string) =>
    apiClient.patch<ChatMessage>(`/customers/chats/${chatId}/messages/${messageId}/`, { message }),
  /** My own messages, within 48 hours; it stays in the thread as "This message was deleted". */
  remove: (chatId: UUID, messageId: UUID) => apiClient.delete<ChatMessage>(`/customers/chats/${chatId}/messages/${messageId}/`),
  markRead: (chatId: UUID) => apiClient.post<MessageResponse>(`/customers/chats/${chatId}/read/`),
  close: (chatId: UUID) => apiClient.post<MessageResponse & { chat_id: UUID }>(`/customers/chats/${chatId}/close/`),
};

/** The older two-step upload (chat files, complaint attachments). */
export const uploadsApi = {
  upload: (file: File | Blob, purpose: 'chat' | 'complaint' | string) => apiClient.upload<Upload>('/customers/uploads/', { file, purpose }),
};

export const tipsApi = {
  staff: (booking_id: UUID) => apiClient.get<TipStaffList>('/customers/tips/staff/', { booking_id }),
  /** Pay now (`payment`) or `charge_to_room` (settled with the bill). */
  create: (body: TipInput) => apiClient.post<TipCreated>('/customers/tips/', body),
  verifyPayment: (tipId: UUID, ids: VerifyIds) => apiClient.post<TipVerifyResult>(`/customers/tips/${tipId}/verify-payment/`, ids),
  list: (params?: PageParams) => apiClient.get<Paginated<Tip>>('/customers/tips/', params),
  stats: () => apiClient.get<TipStats>('/customers/tips/stats/'),
};

export const pickupsApi = {
  locations: (params?: { type?: string; search?: string } & PageParams) =>
    apiClient.get<Paginated<PickupLocation>>('/customers/pickup-locations/', params),
  /** Equals the price of creating the pickup with the same input. */
  estimate: (query: PickupEstimateQuery) => apiClient.get<PickupEstimate>('/customers/pickup-requests/estimate/', query),
  /** 1 hour to 30 days ahead; a location id or a custom address, not both. */
  create: (body: PickupInput) => apiClient.post<PickupResult>('/customers/pickup-requests/create/', body),
  list: (params?: PageParams) => apiClient.get<Paginated<PickupBrief>>('/customers/pickup-requests/', params),
  summary: () => apiClient.get<PickupSummary>('/customers/pickup-requests/summary/'),
  // URLs use the confirmation code, not the id.
  get: (code: string) => apiClient.get<Pickup>(`/customers/pickup-requests/${code}/`),
  update: (code: string, body: PickupUpdate) => apiClient.patch<PickupResult>(`/customers/pickup-requests/${code}/update/`, body),
  cancel: (code: string, cancellation_reason: string) =>
    apiClient.post<PickupResult>(`/customers/pickup-requests/${code}/cancel/`, { cancellation_reason }),
  rate: (code: string, customer_rating: number, customer_feedback?: string) =>
    apiClient.post<PickupResult>(`/customers/pickup-requests/${code}/rate/`, { customer_rating, ...(customer_feedback ? { customer_feedback } : {}) }),
  pay: (code: string, redirect_url?: string) =>
    apiClient.post<PaymentStart>(`/customers/pickup-requests/${code}/pay/`, redirect_url ? { redirect_url } : undefined),
  verifyPayment: (code: string, ids: VerifyIds) => apiClient.post<PickupResult>(`/customers/pickup-requests/${code}/verify-payment/`, ids),
};

export const complaintsApi = {
  create: (body: ComplaintInput) => apiClient.post<ComplaintCreated>('/customers/complaints/', body),
  list: (params?: PageParams) => apiClient.get<Paginated<Complaint>>('/customers/complaints/', params),
  stats: () => apiClient.get<ComplaintStats>('/customers/complaints/stats/'),
  // URLs use complaint_id (e.g. CMP9439K2Z), not id.
  get: (complaintId: string) => apiClient.get<Complaint>(`/customers/complaints/${complaintId}/`),
  respond: (complaintId: string, message: string) =>
    apiClient.post<MessageResponse & { response: ComplaintResponse }>(`/customers/complaints/${complaintId}/responses/`, { message }),
  /** The guest is satisfied. */
  resolve: (complaintId: string) => apiClient.post<MessageResponse & { complaint_id: string }>(`/customers/complaints/${complaintId}/resolve/`),
  /** Only once RESOLVED; closes the complaint. */
  rate: (complaintId: string, body: { rating: number; is_satisfied: boolean; feedback?: string }) =>
    apiClient.post<MessageResponse & { complaint_id: string; status: string }>(`/customers/complaints/${complaintId}/rate/`, body),
};
