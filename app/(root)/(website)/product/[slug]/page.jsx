import axios from 'axios'
import React from 'react'
import ProductDetails from './productDetails'

const ProductPage = async ({ params, searchParams }) => {
  const { slug } = await params
  const { color, size } = await searchParams

  let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/details/${slug}`

  if (color && size) {
    url += `?color=${color}&size=${size}`
  } else if (color) {
    url += `?color=${color}`  // only color selected, no size yet
  }

  try {
    const { data: getProduct } = await axios.get(url)

    if (!getProduct.success) {
      return (
        <div className='flex justify-center items-center py-10 h-75'>
          <h1 className='text-4xl font-semibold'>Data not found.</h1>
        </div>
      )
    }

    return (
      <ProductDetails
        product={getProduct?.data?.product}
        variant={getProduct?.data?.variant}
        colors={getProduct?.data?.colors ?? []}
        sizes={getProduct?.data?.sizes ?? []}
        reviewCount={getProduct?.data?.reviewCount}
      />
    )

  } catch (error) {
    return (
      <div className='flex justify-center items-center py-10 h-75'>
        <h1 className='text-4xl font-semibold'>Something went wrong.</h1>
      </div>
    )
  }
}

export default ProductPage










// import axios from 'axios'
// import React from 'react'
// import ProductDetails from './productDetails'


// const ProductPage = async ({ params, searchParams }) => {
//   const { slug } = await params
//   const { color, size } = await searchParams

//   let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/product/details/${slug}`


//   if (color && size) {
//     url += `?color=${color}&size=${size}`
//   }

//   const { data: getProduct } = await axios.get(url)


//   if (!getProduct.success) {
//     return (
//       <div className='flex justify-center items-center py-10 h-75'>
//         <h1 className='text-4xl found-semibold'>Data not found.</h1>
//       </div>
//     )
//   } else {

//     return (
//        <ProductDetails 
//          product={getProduct?.data?.product}
//          variant={getProduct?.data?.variant}
//          colors={getProduct?.data?.colors}
//          sizes={getProduct?.data?.sizes}
//          reviewCount={getProduct?.data?.reviewCount}
//        />
//     )
//   }
  
// }

// export default ProductPage