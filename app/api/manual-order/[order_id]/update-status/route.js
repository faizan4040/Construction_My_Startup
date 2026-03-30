// FILE PATH: app/api/manual-order/[order_id]/update-status/route.js

import { NextResponse } from 'next/server'
import { sendOrderUpdateEmail } from '@/lib/email/orderUpdateEmail'
import connectDB from '@/lib/databaseConnection'
import '@/models/Category.model'
import ManualOrderModel from '@/models/ManualOrder.model'

const VALID_ORDER_STATUSES   = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const VALID_PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed']

export async function PATCH(request, { params }) {
  try {
    await connectDB()

    // ── CRITICAL FIX: await params in Next.js 15 ──
    const { order_id } = await params

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: 'order_id param is missing' },
        { status: 400 }
      )
    }

    // parse body safely
    let body = {}
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Request body is not valid JSON' },
        { status: 400 }
      )
    }

    const { status, paymentStatus, note = '' } = body

    // validate
    if (!status && !paymentStatus) {
      return NextResponse.json(
        { success: false, message: 'Provide at least status or paymentStatus' },
        { status: 400 }
      )
    }
    if (status && !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }
    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, message: `Invalid paymentStatus. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // find the order
    const existingOrder = await ManualOrderModel.findOne({ order_id })
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: `Order #${order_id} not found` },
        { status: 404 }
      )
    }

    // snapshot old values for email diff
    const oldStatus        = existingOrder.status
    const oldPaymentStatus = existingOrder.paymentStatus

    // build update payload
    const $set = { updatedAt: new Date() }
    if (status)        $set.status        = status
    if (paymentStatus) $set.paymentStatus = paymentStatus
    if (note)          $set.adminNote     = note

    // update DB
    const updated = await ManualOrderModel.findOneAndUpdate(
      { order_id },
      { $set },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Update failed — document not found after update' },
        { status: 500 }
      )
    }

    // send email — non-blocking on failure
    let emailSent  = false
    let emailError = null
    const toEmail  = updated.email || existingOrder.email

    if (toEmail) {
      try {
        await sendOrderUpdateEmail({
          to:               toEmail,
          customerName:     updated.name || 'Customer',
          orderId:          order_id,
          oldStatus,
          newStatus:        updated.status,
          oldPaymentStatus,
          newPaymentStatus: updated.paymentStatus,
          products:         updated.products  || [],
          totalAmount:      updated.totalAmount,
          adminNote:        note,
        })
        emailSent = true
      } catch (err) {
        emailError = err.message
        console.error('[update-status] Email failed:', err.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Order updated and email sent to customer.'
        : `Order updated. Email not sent${emailError ? ': ' + emailError : ' (no email on record).'}`,
      data: {
        order_id,
        status:        updated.status,
        paymentStatus: updated.paymentStatus,
        adminNote:     updated.adminNote || '',
        updatedAt:     updated.updatedAt,
        emailSent,
      },
    })

  } catch (err) {
    console.error('[update-status] Unhandled error:', err)
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}