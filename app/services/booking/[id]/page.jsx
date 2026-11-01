// app/services/booking/[id]/page.jsx
import BookingConfirmed from '@/components/Services/BookingConfirmed'
export default async function Page({ params }) {
  const { id } = await params
  return <BookingConfirmed id={id} />
}