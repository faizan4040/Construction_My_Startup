'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Loader2, CheckCircle2, Landmark } from 'lucide-react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/showToast'
import { SHOP_OWNER_DASHBOARD } from '@/routes/ShopOwnerPanelRoute'

const breadcrumbData = [
  { href: SHOP_OWNER_DASHBOARD, label: 'Home' },
  { href: '/shop/payments', label: 'Payment' },
  { href: '', label: 'Bank Account' },
]

const BankAccountPage = () => {
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [accountHolderName, setAccountHolderName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [ifscInfo, setIfscInfo] = useState(null)
  const [checkingIfsc, setCheckingIfsc] = useState(false)

  useEffect(() => {
    axios.get('/api/shopowner/bank-account')
      .then(({ data }) => setExisting(data.data))
      .catch(() => setExisting(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (ifsc.length !== 11) { setIfscInfo(null); return }
    setCheckingIfsc(true)
    const timeout = setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/shopowner/bank-account/verify-ifsc?ifsc=${ifsc}`)
        setIfscInfo(data.success ? data.data : null)
      } catch {
        setIfscInfo(null)
      } finally {
        setCheckingIfsc(false)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [ifsc])

  const handleSubmit = async () => {
    if (accountNumber !== confirmAccountNumber) {
      showToast('error', 'Account numbers do not match.')
      return
    }
    if (!ifscInfo) {
      showToast('error', 'Please enter a valid IFSC code.')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await axios.post('/api/shopowner/bank-account', {
        accountHolderName, accountNumber, confirmAccountNumber, ifsc,
      })
      if (data.success) {
        showToast('success', data.message)
        setExisting({ accountHolderName, accountNumber: `••••${accountNumber.slice(-4)}`, ifsc, kycStatus: 'verified' })
      } else {
        showToast('error', data.message)
      }
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to add bank account.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <h1 className="text-2xl font-bold text-gray-900 pt-2 pb-4">Bank Account</h1>

      {existing && (
        <Card className="rounded-2xl shadow-sm mb-5 border-green-100">
          <CardContent className="p-5 bg-green-50/50 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={22} />
            <div>
              <p className="font-semibold text-gray-900">{existing.accountHolderName}</p>
              <p className="text-sm text-gray-600">A/C {existing.accountNumber} · {existing.ifsc}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl shadow-sm max-w-xl">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2">{existing ? 'Update Bank Account' : 'Add Bank Account'}</h3>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Account Holder Name</label>
            <Input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} className="rounded-xl h-11" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Account Number</label>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} className="rounded-xl h-11" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm Account Number</label>
            <Input value={confirmAccountNumber} onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))} className="rounded-xl h-11" />
            {confirmAccountNumber && accountNumber !== confirmAccountNumber && (
              <p className="text-xs text-red-500 mt-1">Account numbers do not match.</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">IFSC Code</label>
            <Input value={ifsc} onChange={(e) => setIfsc(e.target.value.toUpperCase())} maxLength={11} className="rounded-xl h-11" />
            {checkingIfsc && <p className="text-xs text-gray-400 mt-1">Checking IFSC...</p>}
            {!checkingIfsc && ifsc.length === 11 && ifscInfo && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Landmark size={12} /> {ifscInfo.bank}, {ifscInfo.branch}
              </p>
            )}
            {!checkingIfsc && ifsc.length === 11 && !ifscInfo && (
              <p className="text-xs text-red-500 mt-1">Invalid IFSC code. Please enter correct details.</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !ifscInfo || accountNumber !== confirmAccountNumber || !accountHolderName}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Bank Account'}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

export default BankAccountPage