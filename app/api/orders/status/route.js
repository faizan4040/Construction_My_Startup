import { NextResponse } from "next/server"
import connectDB from "@/lib/databaseConnection"
import OrderModel from "@/models/Order.model"

export async function GET() {
  try {
    await connectDB()

    const [
      OrderCancel,
      OrderShipped,
      Delivered,
      PendingPayment,
      InProgress,
      PendingReview,
    ] = await Promise.all([
      // cancelled orders
      OrderModel.countDocuments({ status: "cancelled", deleteAt: null }),

      // shipped orders
      OrderModel.countDocuments({ status: "shipped", deleteAt: null }),

      // delivered orders
      OrderModel.countDocuments({ status: "delivered", deleteAt: null }),

      // payment pending (no payment_id)
      OrderModel.countDocuments({
        deleteAt: null,
        $or: [
          { payment_id: { $exists: false } },
          { payment_id: null },
          { payment_id: "" },
        ],
      }),

      // in progress (processing)
      OrderModel.countDocuments({
        status: "processing",
        deleteAt: null,
      }),

      // unverified
      OrderModel.countDocuments({
        status: "unverified",
        deleteAt: null,
      }),
    ])

    return NextResponse.json({
      PaymentRefund: 0,          // future use
      OrderCancel,
      OrderShipped,
      OrderDelivering: 0,        // you don't have this status yet
      PendingReview,
      PendingPayment,
      Delivered,
      InProgress,
    })
  } catch (error) {
    console.error("STATUS API ERROR:", error)

    return NextResponse.json(
      {
        PaymentRefund: 0,
        OrderCancel: 0,
        OrderShipped: 0,
        OrderDelivering: 0,
        PendingReview: 0,
        PendingPayment: 0,
        Delivered: 0,
        InProgress: 0,
      },
      { status: 500 }
    )
  }
}