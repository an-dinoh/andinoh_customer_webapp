import { redirect } from "next/navigation";

/** Bookings aren't kept on the device; a guest finds theirs through the emailed link. */
export default function GuestBookingsPage() {
  redirect("/bookings/find");
}
