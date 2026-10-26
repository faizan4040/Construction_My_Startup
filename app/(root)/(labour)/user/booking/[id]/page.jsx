import UserBookingTracker from '@/components/Application/Labour/UserBookingTracker'

export default async function Page({ params }) {
  const { id } = await params
  return <UserBookingTracker bookingId={id} />
}