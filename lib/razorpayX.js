import axios from "axios"

const authHeader = {
  auth: { username: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, password: process.env.RAZORPAY_KEY_SECRET },
}

// ── Public IFSC lookup — real bank/branch verify, no auth needed ──
export async function verifyIFSC(ifsc) {
  try {
    const { data } = await axios.get(`https://ifsc.razorpay.com/${ifsc.toUpperCase()}`)
    return { valid: true, bank: data.BANK, branch: data.BRANCH }
  } catch {
    return { valid: false }
  }
}

export async function createRazorpayContact({ name, referenceId }) {
  const { data } = await axios.post(
    "https://api.razorpay.com/v1/contacts",
    { name, type: "vendor", reference_id: referenceId },
    authHeader
  )
  return data
}

export async function createFundAccount({ contactId, accountHolderName, accountNumber, ifsc }) {
  const { data } = await axios.post(
    "https://api.razorpay.com/v1/fund_accounts",
    {
      contact_id: contactId,
      account_type: "bank_account",
      bank_account: { name: accountHolderName, ifsc: ifsc.toUpperCase(), account_number: accountNumber },
    },
    authHeader
  )
  return data
}

export async function createPayout({ fundAccountId, amountInRupees, referenceId, narration }) {
  const { data } = await axios.post(
    "https://api.razorpay.com/v1/payouts",
    {
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
      fund_account_id: fundAccountId,
      amount: Math.round(amountInRupees * 100), // paise
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: referenceId,
      narration: narration || "ConstructEzy seller payout",
    },
    authHeader
  )
  return data
}