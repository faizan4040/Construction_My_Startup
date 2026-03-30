import connectDB from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperfunction'

// ── CRITICAL FIX ──────────────────────────────────────────────────
// Import Category model BEFORE ManualOrderModel so Mongoose registers
// its schema. Without this, .populate('products.category') throws:
// "Schema hasn't been registered for model Category"
// Option A — most common in your project (matches ManualOrder.model.js pattern)
import '@/models/Category.model'

// ─────────────────────────────────────────────────────────────────

import ManualOrderModel from '@/models/ManualOrder.model'

/* =====================================================================
   GET /api/manual-order/[order_id]
   Fetches a single manual order by its order_id string (e.g. MANUAL-1234)
   ===================================================================== */
export async function GET(request, { params }) {
  try {
    // FIX: In Next.js 15, dynamic params must be awaited before use
    const { order_id } = await params

    if (!order_id) return response(false, 400, 'order_id is required.')

    await connectDB()

    const order = await ManualOrderModel.findOne({ order_id })
      .populate('products.category', 'name')
      .lean()

    if (!order) return response(false, 404, 'Order not found.')

    return response(true, 200, 'Order fetched successfully.', order)
  } catch (error) {
    return catchError(error)
  }
}