import { NextResponse } from 'next/server'
import { sendOrderUpdateEmail } from '@/lib/email/orderUpdateEmail'
import connectDB from '@/lib/databaseConnection'
import { isAuthenticated } from '@/lib/authentication'
import '@/models/Category.model'
import ManualOrderModel from '@/models/ManualOrder.model'
import UserModel from '@/models/User.model'

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const VALID_PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed']

export async function PATCH(request, { params }) {
  try {
    await connectDB()

    const auth = await isAuthenticated('shop owner')
    if (!auth.isAuth) return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select('shop')
    if (!user?.shop) return NextResponse.json({ success: false, message: 'No shop linked.' }, { status: 400 })

    const { order_id } = await params
    if (!order_id) return NextResponse.json({ success: false, message: 'order_id param is missing' }, { status: 400 })

    let body = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, message: 'Request body is not valid JSON' }, { status: 400 })
    }

    const { status, paymentStatus, note = '' } = body
    if (!status && !paymentStatus) {
      return NextResponse.json({ success: false, message: 'Provide at least status or paymentStatus' }, { status: 400 })
    }
    if (status && !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}` }, { status: 400 })
    }
    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ success: false, message: `Invalid paymentStatus.` }, { status: 400 })
    }

    // ownership guard — must belong to this shop
    const existingOrder = await ManualOrderModel.findOne({ order_id, shop: user.shop })
    if (!existingOrder) {
      return NextResponse.json({ success: false, message: `Order #${order_id} not found` }, { status: 404 })
    }

    const oldStatus = existingOrder.status
    const oldPaymentStatus = existingOrder.paymentStatus

    const $set = { updatedAt: new Date() }
    if (status) $set.status = status
    if (paymentStatus) $set.paymentStatus = paymentStatus
    if (note) $set.adminNote = note

    const updated = await ManualOrderModel.findOneAndUpdate(
      { order_id, shop: user.shop },
      { $set },
      { new: true }
    )

    let emailSent = false
    let emailError = null
    const toEmail = updated.email || existingOrder.email

    if (toEmail) {
      try {
        await sendOrderUpdateEmail({
          to: toEmail,
          customerName: updated.name || 'Customer',
          orderId: order_id,
          oldStatus,
          newStatus: updated.status,
          oldPaymentStatus,
          newPaymentStatus: updated.paymentStatus,
          products: updated.products || [],
          totalAmount: updated.totalAmount,
          adminNote: note,
        })
        emailSent = true
      } catch (err) {
        emailError = err.message
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? 'Order updated and email sent to customer.' : `Order updated. Email not sent${emailError ? ': ' + emailError : ''}`,
      data: { order_id, status: updated.status, paymentStatus: updated.paymentStatus, emailSent },
    })
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || 'Internal server error' }, { status: 500 })
  }
}