import connectDB from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperfunction'
import { isAuthenticated } from '@/lib/authentication'
import ManualOrderModel from '@/models/ManualOrder.model'
import UserModel from '@/models/User.model'
import '@/models/Category.model'

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated('shop owner')
    if (!auth.isAuth) return response(false, 401, 'Unauthorized.')

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select('shop')
    if (!user?.shop) return response(false, 400, 'No shop linked to this account.')

    const { order_id } = await params
    if (!order_id) return response(false, 400, 'order_id is required.')

    const order = await ManualOrderModel.findOne({ order_id, shop: user.shop })
      .populate('products.category', 'name')
      .lean()

    if (!order) return response(false, 404, 'Order not found.')

    return response(true, 200, 'Order fetched successfully.', order)
  } catch (error) {
    return catchError(error)
  }
}