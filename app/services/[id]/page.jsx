// app/services/[id]/page.jsx
import ServiceDetail from '@/components/Services/ServiceDetail'
export default async function Page({ params }) {
  const { id } = await params
  return <ServiceDetail id={id} />
}