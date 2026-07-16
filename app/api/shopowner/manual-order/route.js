import { isAuthenticated } from '@/lib/authentication'
import connectDB from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperfunction'
import ManualOrderModel from '@/models/ManualOrder.model'
import UserModel from '@/models/User.model'
import '@/models/Category.model'
import { NextResponse } from 'next/server'

/* ===================== LIST (DatatableWrapper-compatible) ===================== */
export async function GET(request) {
  try {
    const auth = await isAuthenticated('shop owner')
    if (!auth.isAuth) return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select('shop')
    if (!user?.shop) return NextResponse.json({ success: false, message: 'No shop linked.' }, { status: 400 })

    const { searchParams } = new URL(request.url)
    const start = parseInt(searchParams.get('start') || '0', 10)
    const size = parseInt(searchParams.get('size') || '10', 10)
    const globalFilter = searchParams.get('globalFilter') || ''
    const deleteType = searchParams.get('deleteType')

    let filters = []
    let sorting = []
    try {
      filters = JSON.parse(searchParams.get('filters') || '[]')
      sorting = JSON.parse(searchParams.get('sorting') || '[]')
    } catch {}

    const matchQuery = {
      shop: user.shop,
      deletedAt: deleteType === 'PD' ? { $ne: null } : null,
    }

    if (globalFilter) {
      matchQuery.$or = [
        { order_id: new RegExp(globalFilter, 'i') },
        { name: new RegExp(globalFilter, 'i') },
        { email: new RegExp(globalFilter, 'i') },
        { phone: new RegExp(globalFilter, 'i') },
      ]
    }
    filters.forEach((f) => { matchQuery[f.id] = new RegExp(f.value, 'i') })

    let sortQuery = { createdAt: -1 }
    if (sorting.length) {
      sortQuery = {}
      sorting.forEach((s) => { sortQuery[s.id] = s.desc ? -1 : 1 })
    }

    const totalRowCount = await ManualOrderModel.countDocuments(matchQuery)
    const orders = await ManualOrderModel.find(matchQuery)
      .populate('products.category', 'name')
      .sort(sortQuery)
      .skip(start)
      .limit(size)
      .lean()

    return NextResponse.json({ success: true, data: orders, meta: { totalRowCount } })
  } catch (error) {
    return catchError(error)
  }
}

/* ===================== CREATE ===================== */
export async function POST(request) {
  try {
    const auth = await isAuthenticated('shop owner')
    if (!auth.isAuth) return response(false, 401, 'Unauthorized.')

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select('shop')
    if (!user?.shop) return response(false, 400, 'No shop linked to this account.')

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
      order_id: `SHOP-${user.shop.toString().slice(-6)}-${Date.now()}`,
      shop: user.shop,
      name,
      email: email || '',
      phone,
      address,
      products: [
        { name: productName, category, qty: quantity, price: productPrice, media: media || '', subtotal },
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