import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { generateBarcodePNG, generateQRCodePNG, buildLabelHTML } from "@/lib/labelGenerator"
import OrderModel from "@/models/Order.model"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const { order_id } = await params
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    const order = await OrderModel.findOne({ order_id, deleteAt: null })
    if (!order) return response(false, 404, "Order not found.")

    const item = order.products.find((p) => String(p.productId) === productId)
    if (!item?.labelCode) return response(false, 400, "Label not generated yet.")

    // ── Real tracking URL — customer or courier can scan and open this ──
    const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/track/${item.labelCode}`

    const [barcodeBuffer, qrBuffer] = await Promise.all([
      Promise.resolve(generateBarcodePNG(item.labelCode)),
      generateQRCodePNG(item.labelCode),
    ])

    const html = buildLabelHTML({
      order,
      item,
      barcodeBase64: barcodeBuffer.toString("base64"),
      qrBase64: qrBuffer.toString("base64"),
      shop: {
        shopName: "CONSTRUCTEZY",
        shopAddress: "123, Builder's Avenue, Sector 45, Noida - 201301, Uttar Pradesh, IN",
        gstin: "[GSTIN TO BE ADDED]",
      },
    })

    return new NextResponse(html, { headers: { "Content-Type": "text/html" } })
  } catch (error) {
    return catchError(error, "Failed to generate label.")
  }
}