import axios from "axios"

const authConfig = {
  auth: {
    username: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    password: process.env.RAZORPAY_KEY_SECRET,
  },
}

// ── Creates a real, scannable UPI QR for an exact amount ──
// Razorpay itself returns a ready-made QR image (image_url) — no need
// to generate our own QR image, and it auto-detects payment via status.
export async function createPaymentQR({ amount, orderId, description }) {
  const { data } = await axios.post(
    "https://api.razorpay.com/v1/payments/qr_codes",
    {
      type: "upi_qr",
      name: "ConstructEzy Payment",
      usage: "single_use",
      fixed_amount: true,
      payment_amount: Math.round(amount * 100), // paise
      description: description || `Payment for order ${orderId}`,
      close_by: Math.floor(Date.now() / 1000) + 30 * 60, // valid 30 min
      notes: { orderId },
    },
    authConfig
  )
  return data // { id, image_url, status, ... }
}

export async function getPaymentQRStatus(qrCodeId) {
  const { data } = await axios.get(
    `https://api.razorpay.com/v1/payments/qr_codes/${qrCodeId}`,
    authConfig
  )
  return data // { status: "active" | "closed", payments_amount_received, ... }
}