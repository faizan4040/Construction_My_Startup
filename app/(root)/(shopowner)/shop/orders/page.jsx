'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { XCircle, Truck, PackageCheck, CheckCircle, Clock, Loader2, Package } from 'lucide-react'
import { ListItemIcon, MenuItem, Tabs, Tab } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import axios from 'axios'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper'
import ViewAction from '@/components/Application/Admin/ViewAction'

import { Card, CardContent } from '@/components/ui/card'
import { DT_ORDER_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperfunction'
import { showToast } from '@/lib/showToast'
import { SHOP_OWNER_DASHBOARD, SHOP_OWNER_ORDER_DETAILS } from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Orders' },
]

const EMPTY_STATUS = { on_hold: 0, pending: 0, ready_to_ship: 0, shipped: 0, delivered: 0, cancelled: 0 }

// ── Each status gets an icon + color theme, used for both the stat
// cards and the tab strip so the whole page feels consistent ──
const STATUS_META = {
  on_hold:       { label: 'On Hold',       icon: Clock,        color: '#f59e0b', bg: '#fffbeb', ring: '#fde68a' },
  pending:       { label: 'Pending',       icon: PackageCheck, color: '#f97316', bg: '#fff7ed', ring: '#fed7aa' },
  ready_to_ship: { label: 'Ready to Ship', icon: Package,      color: '#3b82f6', bg: '#eff6ff', ring: '#bfdbfe' },
  shipped:       { label: 'Shipped',       icon: Truck,        color: '#8b5cf6', bg: '#f5f3ff', ring: '#ddd6fe' },
  delivered:     { label: 'Delivered',     icon: CheckCircle,  color: '#10b981', bg: '#ecfdf5', ring: '#a7f3d0' },
  cancelled:     { label: 'Cancelled',     icon: XCircle,      color: '#ef4444', bg: '#fef2f2', ring: '#fecaca' },
}

const TAB_ORDER = ['on_hold', 'pending', 'ready_to_ship', 'shipped', 'cancelled']

const ShopOwnerShowOrders = () => {
  const [statusCounts, setStatusCounts] = useState(EMPTY_STATUS)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [activeTab, setActiveTab] = useState('on_hold')
  const [busyOrderId, setBusyOrderId] = useState(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/shopowner/orders/status', { cache: 'no-store' })
      const data = await res.json()
      if (data) setStatusCounts(data)
    } catch {
      setStatusCounts(EMPTY_STATUS)
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const columns = useMemo(() => columnConfig(DT_ORDER_COLUMN), [])

  const handleAccept = async (orderId) => {
    setBusyOrderId(orderId)
    try {
      const { data } = await axios.post(`/api/shopowner/orders/${orderId}/accept`)
      showToast(data.success ? 'success' : 'error', data.message)
      fetchStatus()
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Action failed.')
    } finally {
      setBusyOrderId(null)
    }
  }

  const handleCancel = async (orderId) => {
    const reason = prompt('Reason for cancellation (optional):') || ''
    setBusyOrderId(orderId)
    try {
      const { data } = await axios.post(`/api/shopowner/orders/${orderId}/cancel`, { reason })
      showToast(data.success ? 'success' : 'error', data.message)
      fetchStatus()
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Action failed.')
    } finally {
      setBusyOrderId(null)
    }
  }

  const handleDownloadLabel = (orderId, productId) => {
    const id = typeof productId === 'object' && productId !== null ? productId._id : productId
    if (!id) {
      showToast('error', 'Product information missing.')
      return
    }
    window.open(`/api/shopowner/orders/${orderId}/label?productId=${id}`, '_blank')
  }

  const action = useCallback((row, deleteType, handleDelete) => {
    const order = row.original
    const item = order?.products?.[0]

    const items = [
      <ViewAction key="view" href={SHOP_OWNER_ORDER_DETAILS(order.order_id)} />,
    ]

    if (activeTab === 'pending') {
      items.push(
        <MenuItem key="accept" disabled={busyOrderId === order.order_id} onClick={() => handleAccept(order.order_id)}>
          <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
          Accept
        </MenuItem>,
        <MenuItem key="cancel-action" disabled={busyOrderId === order.order_id} onClick={() => handleCancel(order.order_id)}>
          <ListItemIcon><XCircle fontSize="small" /></ListItemIcon>
          Cancel
        </MenuItem>
      )
    }

    if (activeTab === 'ready_to_ship') {
      items.push(
        <MenuItem key="label" onClick={() => handleDownloadLabel(order.order_id, item?.productId)}>
          <ListItemIcon><PackageCheck fontSize="small" /></ListItemIcon>
          Download Label
        </MenuItem>
      )
    }

    if (deleteType === 'PD') {
      items.push(
        <MenuItem key="restore" onClick={() => handleDelete([order._id], 'RSD')}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          Restore
        </MenuItem>,
        <MenuItem key="permanent-delete" onClick={() => handleDelete([order._id], 'PD')}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          Delete Permanently
        </MenuItem>
      )
    } else {
      items.push(
        <MenuItem key="delete" onClick={() => handleDelete([order._id], 'SD')}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          Delete
        </MenuItem>
      )
    }

    return items
  }, [activeTab, busyOrderId])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      {/* ══ Header ══ */}
      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage every order across your store, live.</p>
      </div>

      {/* ══ Stat cards ══ */}
      <div className="py-4">
        {loadingStatus ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TAB_ORDER.map((key) => {
              const meta = STATUS_META[key]
              const Icon = meta.icon
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="text-left rounded-2xl p-4 border transition-all duration-150"
                  style={{
                    background: meta.bg,
                    borderColor: isActive ? meta.color : meta.ring,
                    boxShadow: isActive ? `0 0 0 2px ${meta.color}33` : 'none',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: '#fff', color: meta.color, boxShadow: `0 0 0 1px ${meta.ring}` }}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                  <p className="text-2xl font-bold leading-none" style={{ color: meta.color }}>
                    {statusCounts[key] ?? 0}
                  </p>
                  <p className="text-xs font-medium text-gray-600 mt-1.5">{meta.label}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ══ Tabs + Table ══ */}
      <div className="pb-6">
        <Card className="rounded-3xl shadow-sm overflow-hidden py-0 gap-0 border-gray-200">
          <div className="border-b bg-gray-50/60 px-4 pt-3">
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ style: { height: 3, borderRadius: 3, background: STATUS_META[activeTab].color } }}
            >
              {TAB_ORDER.map((key) => {
                const meta = STATUS_META[key]
                return (
                  <Tab
                    key={key}
                    value={key}
                    label={
                      <span className="flex items-center gap-2 normal-case font-medium text-sm">
                        {meta.label}
                        <span
                          className="text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {statusCounts[key] ?? 0}
                        </span>
                      </span>
                    }
                  />
                )
              })}
            </Tabs>
          </div>

          <CardContent className="pb-5 px-3 pt-3">
            <DatatableWrapper
              key={activeTab}
              querykey={`shopowner-orders-${activeTab}`}
              fetchUrl={`/api/shopowner/orders?status=${activeTab}`}
              initialPageSize={10}
              columnsConfig={columns}
              createAction={action}
              deleteEndpoint="/api/shopowner/orders/delete"
              deleteType="SD"
              trashView={false}
              defaultHiddenColumns={['email', 'country', 'state', 'city', 'pincode', 'couponDiscount']}
              renderDetailPanel={(row) => {
                const order = row.original
                const item = order.products?.[0]
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm bg-gray-50/50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Email</p>
                      <p className="font-medium truncate">{order.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Address</p>
                      <p className="font-medium">
                        {[order.address, order.landmark].filter(Boolean).join(', ') || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">City / State</p>
                      <p className="font-medium">{[order.city, order.state].filter(Boolean).join(', ') || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Pincode</p>
                      <p className="font-medium">{order.pincode || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Qty</p>
                      <p className="font-medium">{item?.qty ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Payment</p>
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: order.paymentStatus === 'Paid' ? '#ecfdf5' : '#fff7ed',
                          color: order.paymentStatus === 'Paid' ? '#10b981' : '#f97316',
                        }}
                      >
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Discount</p>
                      <p className="font-medium">₹{order.discount ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Coupon</p>
                      <p className="font-medium">₹{order.couponDiscount ?? 0}</p>
                    </div>
                  </div>
                )
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ShopOwnerShowOrders