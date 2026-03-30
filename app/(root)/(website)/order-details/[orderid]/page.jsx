import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import { IMAGES } from '@/routes/AllImages'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const OrderDetails = async ({ params }) => {
  const { orderid } = await params

  const { data: orderData } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/get/${orderid}`
  )

  const breadcrumb = {
    title: 'Order Details',
    links: [{ label: 'Order Details' }],
  }

  return (
    <div>
      <WebsiteBreadcrumb props={breadcrumb} />

      <div className='lg:px-32 px-5 my-20'>
        {orderData && !orderData.success ?
          <div className='flex justify-center items-center py-32'>
            <h4 className='text-red-600 text-xl font-semibold'>Order Not Found</h4>
          </div>
          :
          <div>
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <div className="grid sm:grid-cols-3 grid-cols-1 gap-3 text-sm">

                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-semibold text-gray-900">
                    {orderData?.data?.order_id || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-semibold text-gray-900">
                    {orderData?.data?.payment_id || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize
                    ${orderData?.data?.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : orderData?.data?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                  >
                    {orderData?.data?.status || 'unknown'}
                  </span>
                </div>

              </div>
            </div>

            <div className="overflow-x-auto ">
              <table className="w-full border-collapse border border-gray-200 ">
                {/* Table Head */}
                <thead className="bg-gray-100 ">
                  <tr>
                    <th className="text-start p-3 text-gray-700 font-semibold">Product</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Price</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Quantity</th>
                    <th className="text-center p-3 text-gray-700 font-semibold">Total</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {orderData?.data?.products?.map((product) => (
                    <tr
                      key={product.variantId._id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {/* Product Info */}
                      <td className="p-3 flex items-center gap-4">
                        <Image
                          src={product?.variantId?.media[0]?.secure_url || IMAGES.image_placeholder}
                          width={60}
                          height={60}
                          alt={product?.productId?.name}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <Link
                            href={WEBSITE_PRODUCT_DETAILS(product?.productId?.slug)}
                            className="font-medium text-gray-800 hover:underline"
                          >
                            {product?.productId?.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">Color: {product?.variantId?.color}</p>
                          <p className="text-sm text-gray-500">Size: {product?.variantId?.size}</p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="text-center p-3 text-gray-700 font-medium">
                        {product.sellingPrice.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>

                      {/* Quantity */}
                      <td className="text-center p-3 text-gray-700 font-medium">{product.qty}</td>

                      {/* Total */}
                      <td className="text-center p-3 text-gray-900 font-semibold">
                        {(product.qty * product.sellingPrice).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-10">
              {/* Shipping Address */}
              <div className="p-6 bg-white shadow rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold mb-4 border-b pb-2">Shipping Address</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{orderData?.data?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{orderData?.data?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{orderData?.data?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Address:</span>
                    <span>{orderData?.data?.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Country:</span>
                    <span>{orderData?.data?.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">State:</span>
                    <span>{orderData?.data?.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">City:</span>
                    <span>{orderData?.data?.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Pincode:</span>
                    <span>{orderData?.data?.pincode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Landmark:</span>
                    <span>{orderData?.data?.landmark}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Order Note:</span>
                    <span>{orderData?.data?.ordernote || '...'}</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="p-6 bg-white shadow rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span>{orderData?.data?.subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Discount</span>
                    <span>{orderData?.data?.discount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Coupon Discount</span>
                    <span>{orderData?.data?.couponDiscount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between mt-4 pt-2 border-t text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{orderData?.data?.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        }

      </div>
    </div>
  )
}

export default OrderDetails







