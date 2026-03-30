'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  FilePlus,
  CreditCard,
  XCircle,
  Truck,
  PackageCheck,
  Star,
  DollarSign,
  CheckCircle,
  Loader,
} from 'lucide-react'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import ViewAction from '@/components/Application/Admin/ViewAction'
import StatusCard from '../dashboard/StatusCard'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { DT_ORDER_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import {
  ADMIN_DASHBOARD,
  ADMIN_MANUAL_ORDERS_ADD,
  ADMIN_ORDER_DETAILS,
  ADMIN_TRASH,
} from '@/routes/AdminPanelRoute'

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: '', label: 'Orders' },
]

const EMPTY_STATUS = {
  PaymentRefund: 0,
  OrderCancel: 0,
  OrderShipped: 0,
  OrderDelivering: 0,
  PendingReview: 0,
  PendingPayment: 0,
  Delivered: 0,
  InProgress: 0,
}

const ShowOrders = () => {
  /* ================= STATUS ================= */
  const [statusCounts, setStatusCounts] = useState(EMPTY_STATUS)
  const [loadingStatus, setLoadingStatus] = useState(true)

useEffect(() => {
  let mounted = true

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/orders/status', {
        cache: 'no-store',
      })

      const data = await res.json()

      if (mounted && data) {
        setStatusCounts(data)
      }
    } catch (error) {
      if (mounted) {
        setStatusCounts({
          PaymentRefund: 0,
          OrderCancel: 0,
          OrderShipped: 0,
          OrderDelivering: 0,
          PendingReview: 0,
          PendingPayment: 0,
          Delivered: 0,
          InProgress: 0,
        })
      }
    } finally {
      mounted && setLoadingStatus(false)
    }
  }

  fetchStatus()

  return () => {
    mounted = false
  }
}, [])

  /* ================= TABLE ================= */
  const columns = useMemo(() => columnConfig(DT_ORDER_COLUMN), [])

  const action = useCallback((row, deleteType, handleDelete) => {
    return [
      <ViewAction
        key="view"
        href={ADMIN_ORDER_DETAILS(row.original.order_id)}
      />,
      <DeleteAction
        key="delete"
        handleDelete={handleDelete}
        row={row}
        deleteType={deleteType}
      />,
    ]
  }, [])

  return (
    <div>
      {/* Breadcrumb */}
      <BreadCrumb breadcrumbData={breadcrumbData} />

      {/* ================= STATUS CARDS ================= */}
      <div className="py-4">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <h4 className="text-lg font-semibold">Order Overview</h4>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {loadingStatus ? (
                <div className="col-span-full flex justify-center py-6">
                  <Loader className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <StatusCard title="Payment Refund" count={statusCounts.PaymentRefund} icon={<CreditCard />} />
                  <StatusCard title="Order Cancel" count={statusCounts.OrderCancel} icon={<XCircle />} />
                  <StatusCard title="Order Shipped" count={statusCounts.OrderShipped} icon={<Truck />} />
                  <StatusCard title="Order Delivering" count={statusCounts.OrderDelivering} icon={<PackageCheck />} />
                  <StatusCard title="Pending Review" count={statusCounts.PendingReview} icon={<Star />} />
                  <StatusCard title="Pending Payment" count={statusCounts.PendingPayment} icon={<DollarSign />} />
                  <StatusCard title="Delivered" count={statusCounts.Delivered} icon={<CheckCircle />} />
                  <StatusCard title="In Progress" count={statusCounts.InProgress} icon={<Loader className="animate-spin" />} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= ORDERS TABLE (UNCHANGED) ================= */}
      <div className="py-4">
        <Card className="py-0 max-w-302.5 rounded-3xl shadow-sm gap-0">
          <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-semibold">Orders</h4>

              <Button className="bg-[#fff0ea] text-orange-400 hover:bg-orange-500 hover:text-white flex items-center gap-2">
                <FilePlus />
                <Link href={ADMIN_MANUAL_ORDERS_ADD}>MANUAL ORDER</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pb-5 px-0 pt-0">
            <DatatableWrapper
              querykey="orders-data"
              fetchUrl="/api/orders"
              initialPageSize={10}
              columnsConfig={columns}
              exportEndpoint="/api/orders/export"
              deleteEndpoint="/api/orders/delete"
              deleteType="SD"
              trashView={`${ADMIN_TRASH}?trashof=orders`}
              createAction={action}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ShowOrders








