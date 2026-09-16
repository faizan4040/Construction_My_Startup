'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import {
  CreditCard, Boxes, UserCircle, Megaphone, Wallet, HelpCircle,
  Loader2, ArrowLeft, Send, Ticket, Clock,
} from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/lib/showToast'
import { SHOP_OWNER_DASHBOARD } from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '', label: 'Support' },
]

const CATEGORIES = [
  { key: 'payment', label: 'Payment', icon: CreditCard, color: '#3b82f6', bg: '#eff6ff' },
  { key: 'inventory', label: 'Inventory', icon: Boxes, color: '#f59e0b', bg: '#fffbeb' },
  { key: 'account', label: 'Account', icon: UserCircle, color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'ads_promotions', label: 'Advertisements & Promotions', icon: Megaphone, color: '#ec4899', bg: '#fdf2f8' },
  { key: 'instant_cash', label: 'Instant Cash', icon: Wallet, color: '#10b981', bg: '#ecfdf5' },
  { key: 'other', label: 'Other', icon: HelpCircle, color: '#6b7280', bg: '#f9fafb' },
]

const STATUS_META = {
  open:        { label: 'Open',        color: '#f97316', bg: '#fff7ed' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
  resolved:    { label: 'Resolved',    color: '#10b981', bg: '#ecfdf5' },
  closed:      { label: 'Closed',      color: '#6b7280', bg: '#f9fafb' },
}

// ── Categories where an Order ID is commonly relevant ──
const ORDER_RELATED = ['payment', 'inventory', 'instant_cash']

const ShopSupportPage = () => {
  const [activeTab, setActiveTab] = useState('help')
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [subject, setSubject] = useState('')
  const [orderId, setOrderId] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(true)

  const fetchTickets = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/shopowner/support/list')
      setTickets(data.data || [])
    } catch {
      setTickets([])
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'ticket') fetchTickets()
  }, [activeTab, fetchTickets])

  const resetForm = () => {
    setSelectedCategory(null)
    setSubject('')
    setOrderId('')
    setDescription('')
  }

  const handleSubmit = async () => {
    if (!subject.trim() || subject.trim().length < 3) {
      showToast('error', 'Please enter a subject.')
      return
    }
    if (!description.trim() || description.trim().length < 10) {
      showToast('error', 'Please describe your issue in a bit more detail.')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await axios.post('/api/shopowner/support/create', {
        category: selectedCategory.key,
        orderId: orderId.trim() || null,
        subject: subject.trim(),
        description: description.trim(),
      })

      if (data.success) {
        showToast('success', data.message)
        resetForm()
        setActiveTab('ticket')
      } else {
        showToast('error', data.message)
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className="pt-2 pb-1">
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-sm text-gray-500 mt-0.5">Get help with payments, inventory, account, and more.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-4 mb-5 border-b">
        <button
          onClick={() => { setActiveTab('help'); resetForm() }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'help' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Help
        </button>
        <button
          onClick={() => setActiveTab('ticket')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'ticket' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Ticket
        </button>
      </div>

      {activeTab === 'help' && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-5 sm:p-6">
            {!selectedCategory ? (
              <>
                <p className="text-sm font-medium text-gray-700 mb-4">What do you need help with?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat)}
                        className="text-left rounded-2xl border p-4 hover:shadow-md transition-all"
                        style={{ background: cat.bg, borderColor: cat.bg }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white"
                          style={{ color: cat.color, boxShadow: `0 0 0 1px ${cat.color}22` }}
                        >
                          <Icon size={18} />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{cat.label}</p>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5"
                >
                  <ArrowLeft size={15} /> Back to categories
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: selectedCategory.bg, color: selectedCategory.color }}
                  >
                    <selectedCategory.icon size={18} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{selectedCategory.label}</h3>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Subject *</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Briefly describe your issue"
                      className="rounded-xl h-11"
                    />
                  </div>

                  {ORDER_RELATED.includes(selectedCategory.key) && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Order ID <span className="text-gray-400 font-normal">(if applicable)</span>
                      </label>
                      <Input
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="e.g. order_ABC123XYZ"
                        className="rounded-xl h-11"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description *</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Explain the issue in detail — the more info, the faster we can help."
                      rows={5}
                      className="rounded-xl"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Submit Ticket
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'ticket' && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-5 sm:p-6">
            {loadingTickets ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No tickets raised yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => {
                  const status = STATUS_META[t.status] || STATUS_META.open
                  const catMeta = CATEGORIES.find((c) => c.key === t.category)
                  return (
                    <div key={t._id} className="border rounded-2xl p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-400">{catMeta?.label || t.category}</span>
                          {t.orderId && (
                            <span className="text-xs text-gray-400">· Order: {t.orderId}</span>
                          )}
                        </div>
                        <p className="font-medium text-sm text-gray-900">{t.subject}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Clock size={11} /> {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span
                        className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ShopSupportPage