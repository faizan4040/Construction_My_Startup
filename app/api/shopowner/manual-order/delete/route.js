import { isAuthenticated } from '@/lib/authentication'
import connectDB from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperfunction'
import ManualOrderModel from '@/models/ManualOrder.model'
import UserModel from '@/models/User.model'

export async function PUT(request) {
  try {
    const auth = await isAuthenticated('shop owner')
    if (!auth.isAuth) return response(false, 401, 'Unauthorized.')

    await connectDB()

    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select('shop')
    if (!user?.shop) return response(false, 400, 'No shop linked to this account.')

    const payload = await request.json()
    const ids = payload.ids || []
    const deleteType = payload.deleteType

    if (!Array.isArray(ids) || ids.length === 0) return response(false, 400, 'Invalid or empty id list.')
    if (!['SD', 'RSD'].includes(deleteType)) return response(false, 400, 'Invalid delete operation.')

    const data = await ManualOrderModel.find({ _id: { $in: ids }, shop: user.shop })
    if (!data.length) return response(false, 404, 'Data not found or not owned by you.')

    const validIds = data.map((d) => d._id)

    if (deleteType === 'SD') {
      await ManualOrderModel.updateMany({ _id: { $in: validIds } }, { $set: { deletedAt: new Date() } })
    } else {
      await ManualOrderModel.updateMany({ _id: { $in: validIds } }, { $set: { deletedAt: null } })
    }

    return response(true, 200, deleteType === 'SD' ? 'Data moved into trash.' : 'Data restored.')
  } catch (error) {
    return catchError(error)
  }
}