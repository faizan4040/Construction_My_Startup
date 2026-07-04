// app/(root)/(shopowner)/shop/product/page.jsx

import ProductList from '@/components/Application/ShopOwner/Product/ProductList'
const page = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Products</h1>
      <ProductList />
    </div>
  )
}

export default page