import axios from 'axios'

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

// show only the method the customer picked (it must be enabled in the Razorpay dashboard)
const only = (k) => ({ upi: false, card: false, netbanking: false, wallet: false, emi: false, paylater: false, [k]: true })

export async function payOnline({ bookingId, method = 'upi', prefill }) {
  if (!(await loadRazorpay())) throw new Error('Payment window could not load. Check your internet.')
  const { data } = await axios.post(`/api/services/bookings/${bookingId}/pay`, { method: 'online' })

  return new Promise((resolve, reject) => {
    let lastError = ''
    const rz = new window.Razorpay({
      key: data.keyId, amount: data.amount, currency: data.currency, order_id: data.orderId,
      name: 'ConstructEzy', description: data.description, prefill, method: only(method), theme: { color: '#0f7a55' },
      handler: async (res) => {
        try {
          await axios.post(`/api/services/bookings/${bookingId}/verify`, res)
          resolve()
        } catch (e) {
          reject(new Error(e.response?.data?.message || 'Could not verify the payment. If money was deducted, the booking will be confirmed automatically.'))
        }
      },
      modal: { ondismiss: () => reject(new Error(lastError || 'Payment cancelled')) },
    })
    rz.on('payment.failed', (r) => { lastError = r?.error?.description || 'Payment failed' })
    rz.open()
  })
}