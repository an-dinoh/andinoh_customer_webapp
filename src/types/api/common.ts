/**
 * An amount as the API sends it. The guide promises decimal strings ("55000.00"), and serializer
 * fields are; but hand-built responses (folio, booking financials, event payment totals) arrive as
 * JSON numbers on the wire. Format with utils/money, never do float arithmetic for totals.
 */
export type Money = string | number;
/** YYYY-MM-DD */
export type DateString = string;
/** ISO 8601 timestamp */
export type DateTime = string;
export type UUID = string;

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Option<V extends string = string> {
  value: V;
  label: string;
}

export interface MessageResponse {
  message: string;
}

export interface Period {
  start_date: DateString;
  end_date: DateString;
}

export interface PageParams {
  page?: number;
  page_size?: number;
}
