import CategoryList from '@/components/Application/ShopOwner/Category/CategoryList'

const page = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Categories</h1>
      <CategoryList />
    </div>
  )
}

export default page