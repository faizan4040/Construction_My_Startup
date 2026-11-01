export const G = '#0f7a55' // brand green

export const STATUS_UI = {
  pending_payment: { label: 'Awaiting payment', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  assigned: { label: 'Professional sent', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  in_progress: { label: 'In progress', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  completed: { label: 'Completed', cls: 'bg-emerald-600 text-white border-emerald-600' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200' },
}
export const PAY_UI = {
  pending: { label: 'Unpaid', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cod: { label: 'Pay on service', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  failed: { label: 'Failed', cls: 'bg-red-50 text-red-600 border-red-200' },
  refund_pending: { label: 'Refund pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  refunded: { label: 'Refunded', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
}

export const inr = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`
export const fmtDate = (ymd) =>
  ymd ? new Date(`${ymd}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
export const fmtDT = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'