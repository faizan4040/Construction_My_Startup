'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { showToast } from '@/lib/showToast'

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const OrdersList = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/shopowner/order/get')
      if (data.success) setOrders(data.data)
    } catch (err) {
      showToast('error', 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return <div className="h-64 w-full bg-gray-100 rounded-xl animate-pulse" />
  }

  if (orders.length === 0) {
    return <p className="text-center text-gray-500 py-10">No orders yet.</p>
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id} className="rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <p className="font-semibold">{order.customer.name}</p>
                <p className="text-sm text-gray-500">{order.customer.email} · {order.customer.phone}</p>
                <p className="text-sm text-gray-500 mt-1">{order.address}</p>
              </div>
              <Badge className={statusColor[order.status] ?? 'bg-gray-100 text-gray-700'}>
                {order.status}
              </Badge>
            </div>

            <div className="border-t pt-3 space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{(item.sellingPrice * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className="font-semibold">Your total: ₹{order.shopSubtotal.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default OrdersList