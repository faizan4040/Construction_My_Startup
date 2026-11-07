// app/services/book/[id]/page.jsx
import BookingWizard from '@/components/Services/BookingWizard'
export default async function Page({ params }) {
  const { id } = await params
  return <BookingWizard providerId={id} />
}