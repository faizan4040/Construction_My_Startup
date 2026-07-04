import OrdersList from '@/components/Application/ShopOwner/Orders/OrdersList'

const page = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <OrdersList />
    </div>
  )
}

export default page