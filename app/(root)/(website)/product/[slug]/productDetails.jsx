'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { IMAGES } from "@/routes/AllImages"
import { WEBSITE_CART, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from "@/routes/WebsiteRoute"
import { decode, encode } from "entities"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { BiMinus } from "react-icons/bi"
import { IoStar } from "react-icons/io5"
import ButtonLoading from "@/components/Application/ButtonLoading"
import { useDispatch, useSelector } from "react-redux"
import { addIntoCart } from "@/store/reducer/cartReducer"
import { showToast } from "@/lib/showToast"
import { Button } from "@/components/ui/button"
import ProdcutReview from "@/components/Website/ProdcutReview"


const ProductDetails = ({ product, variant, colors = [], sizes = [], reviewCount }) => {
   
  const dispatch = useDispatch()
 const cartStore =
  useSelector((store) => store.cartStore) ?? {
    count: 0,
    products: [],
  }
  
  const [activeThumb, setActiveThumb] = useState(IMAGES.image_placeholder)
  const [qty, setQty] = useState(1)
  const [isAddedIntoCart, setIsAddedIntoCart] = useState(false)
  const [isProductLoading, setIsProductLoading] = useState(false)


  useEffect(() => {
    if (variant?.media?.length) {
      setActiveThumb(variant.media[0].secure_url)
    }

    setIsProductLoading(false)
  }, [variant])

  useEffect(()=>{
     if(cartStore.count > 0) {
      const existingProduct = cartStore.products.findIndex((cartProduct) => 
      cartProduct.productId === product._id && cartProduct.variantId === variant._id)

      if(existingProduct >=0) {
        setIsAddedIntoCart(true)
      }else{
        setIsAddedIntoCart(false)
      }
     }

     setIsProductLoading(false)
  },[])

  const handleQty = (type) => {
    setQty((prev) => {
      if (type === 'inc') return prev + 1
      if (type === 'dec' && prev > 1) return prev - 1
      return prev
    })
  }

  const handleAddToCart = () => {
    const cartProduct = {
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      url: product.slug,
      size: variant.size,
      color: variant.color,
      mrp: variant.mrp,
      sellingPrice: variant.sellingPrice,
      media: variant?.media[0]?.secure_url,
      qty: qty
    }
    dispatch(addIntoCart(cartProduct))
    setIsAddedIntoCart(true)
    showToast('success', 'product added into cart.')
  }

  return (
   <div className="px-4 sm:px-6 lg:px-20 xl:px-32 py-6 sm:py-10">

    {isProductLoading && (
      <div className="fixed top-30 left-1/2 z-50 -translate-x-1/2">
        <img
          src={IMAGES.loading}
          alt="Loading"
          className="w-20 h-20"  
        />
      </div>
    )}

    <div>
      <Breadcrumb className="mb-6 sm:mb-8 text-sm">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={WEBSITE_SHOP}>Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={WEBSITE_PRODUCT_DETAILS(product?.slug)}>
                {product?.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

  {/* Main Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
    {/* Image Section */}
    <div className="flex flex-col-reverse md:flex-row gap-4 md:sticky md:top-24">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
        {variant?.media?.map((img) => (
          <Image
            key={img._id}
            src={img.secure_url}
            alt="thumb"
            width={80}
            height={80}
            onClick={() => setActiveThumb(img.secure_url)}
            className={`min-w-20 rounded-lg cursor-pointer border transition
              ${
                activeThumb === img.secure_url
                  ? "border-primary"
                  : "border-gray-200 hover:border-gray-400"
              }`}
          />
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1">
            <Image
            src={activeThumb || IMAGES.image_placeholder}
            alt="product"
            width={600}
            height={600}
            onLoadingComplete={() => setIsProductLoading(false)}
            className="w-full object-contain rounded-xl border"
          />
      </div>
    </div>

    {/* Product Info */}
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold mb-3">
        {product?.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <IoStar key={i} className="text-yellow-400 text-sm sm:text-base" />
        ))}
        <span className="text-xs sm:text-sm text-gray-600 ml-2">
          ({reviewCount} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-xl sm:text-2xl font-bold">
          {variant?.sellingPrice?.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </span>

        <span className="line-through text-gray-400 text-sm">
          {variant?.mrp?.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
          })}
        </span>

        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
          -{variant?.discountPercentage}%
        </span>
      </div>

      {/* Description */}
      <div
        className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6"
        dangerouslySetInnerHTML={{
          __html: decode(product?.description || ""),
        }}
      />

   
      {/* <div className="mb-6">
        <p className="font-semibold mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {colors.map((color) => {
            return (
              <Link
              key={color}
              onClick={() => setIsProductLoading(true)}
              href={`${WEBSITE_PRODUCT_DETAILS(product.slug)}?color=${color}&size=${variant.size}`}
              className={`border py-1 px-3 rounded-lg cursor-pointer transition
                hover:bg-primary hover:text-white
                ${color === variant.color ? "bg-primary text-white" : ""}`}
            >
              {color}
            </Link>
            )
          })}
        </div>
      </div> */}

      {/* <div className="mb-6">
        <p className="font-semibold mb-2">Size: {variant?.size}</p>

        <div className="flex gap-2 flex-wrap">
          {sizes.map((size) => (
            <Link
              key={size}
              onClick={() => setIsProductLoading(true)}
              href={`${WEBSITE_PRODUCT_DETAILS(product.slug)}?color=${variant.color}&size=${size}`}
              className={`border py-1 px-3 rounded-lg cursor-pointer transition
                hover:bg-primary hover:text-white
                ${size === variant.size ? "bg-primary text-white" : ""}`}
            >
              {size}
            </Link>
          ))}
        </div>
      </div> */}


      {/* Colors */}
      {colors.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
              <Link
                key={color}
                onClick={() => setIsProductLoading(true)}
                href={`${WEBSITE_PRODUCT_DETAILS(product.slug)}?color=${color}`}  // removed size
                className={`border py-1 px-3 rounded-lg cursor-pointer transition
                  hover:bg-primary hover:text-white
                  ${color === variant.color ? "bg-primary text-white" : ""}`}
              >
                {color}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold mb-2">Size: {variant?.size}</p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <Link
                key={size}
                onClick={() => setIsProductLoading(true)}
                href={`${WEBSITE_PRODUCT_DETAILS(product.slug)}?color=${variant.color}&size=${size}`}  // keeps current color
                className={`border py-1 px-3 rounded-lg cursor-pointer transition
                  hover:bg-primary hover:text-white
                  ${size === variant.size ? "bg-primary text-white" : ""}`}
              >
                {size}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mb-8">
        <p className="font-semibold mb-2">Quantity</p>
        <div className="flex items-center w-32 border rounded-full overflow-hidden">
          <button
            onClick={() => handleQty("dec")}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
          >
            <BiMinus />
          </button>
          <input
            value={qty}
            readOnly
            className="w-12 text-center border-none focus:outline-none text-sm"
          />
          <button
            onClick={() => handleQty("inc")}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
          >
            <Plus />
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!isAddedIntoCart ? (
          <ButtonLoading
            onClick={handleAddToCart}
            text='Add to Cart'
            className="flex-1 bg-primary text-white py-3 hover:bg-orange-500 hover:text-white cursor-pointer rounded-full font-semibold hover:opacity-90 transition"
          >
          </ButtonLoading>
        ) : (
          <Button
            asChild
            className="flex-1 bg-primary text-white py-3  hover:bg-orange-500 hover:text-white cursor-pointer rounded-full font-semibold hover:opacity-90 transition"
          >
            <Link href={WEBSITE_CART}>
              Go to Cart
            </Link>
          </Button>
        )}
      </div>

    </div>
  </div>
 
   <div className="mt-16 mb-32">
  <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
    
    {/* Header */}
    <div className="px-6 py-4 bg-gray-50 border-b">
      <h2 className="text-2xl font-semibold text-gray-900">
        Product Description
      </h2>
    </div>

    {/* Content */}
    <div className="px-6 py-5">
      <div
        className="prose max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: encode(product?.description || ''),
        }}
      />
    </div>

  </div>
</div>

   <ProdcutReview productId={product._id}/>


</div>

  )
}

export default ProductDetails
