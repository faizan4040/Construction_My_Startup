import { isAuthenticated } from '@/lib/authentication'
import connectDB from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperfunction'
import ManualOrderModel from '@/models/ManualOrder.model'

/* ===================== GET ALL MANUAL ORDERS ===================== */
export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin')
    if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

    await connectDB()

    const getOrders = await ManualOrderModel.find({ deletedAt: null })
      .sort({ createdAt: -1 }).lean()

    return response(true, 200, 'Orders fetched successfully.', getOrders)
  } catch (error) {
    return catchError(error)
  }
}

/* ===================== CREATE MANUAL ORDER ===================== */
export async function POST(request) {
  try {
    const auth = await isAuthenticated('admin')
    if (!auth.isAuth) return response(false, 403, 'Unauthorized.')

    await connectDB()

    const body = await request.json()
    const { name, email, phone, address, productName, category, qty, price, media } = body

    if (!name || !phone || !address || !productName || !category) {
      return response(false, 400, 'Missing required fields.')
    }

    const quantity = Number(qty)
    const productPrice = Number(price)

    if (quantity <= 0 || productPrice < 0) {
      return response(false, 400, 'Invalid qty or price.')
    }

    const subtotal = quantity * productPrice

    const order = await ManualOrderModel.create({
      order_id: `MANUAL-${Date.now()}`,
      name,
      email: email || '',
      phone,
      address,
      products: [
        {
          name: productName,
          category,
          qty: quantity,
          price: productPrice,
          media: media || '',
          subtotal,
        },
      ],
      subtotal,
      totalAmount: subtotal,
      status: 'pending',
      paymentStatus: 'Pending',
      orderType: 'MANUAL',
    })

    return response(true, 201, 'Manual order created successfully.', order)
  } catch (error) {
    return catchError(error)
  }
}









