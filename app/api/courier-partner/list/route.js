import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import CourierPartnerModel from "@/models/CourierPartner.model"
import ClaimModel from "@/models/Claim.model"
import ReturnModel from "@/models/Return.model"

export async function GET() {
  try {
    await connectDB()

    const partners = await CourierPartnerModel.find({ isActive: true }).sort({ createdAt: 1 })

    // ── Dynamic per-courier stats: avg return time + claims + approval % ──
    const withStats = await Promise.all(
      partners.map(async (p) => {
        const returns = await ReturnModel.find({ courierPartner: p._id, deletedAt: null, trackingStatus: "refunded" })

        const avgReturnTimeDays = returns.length > 0
          ? (returns.reduce((sum, r) => sum + (r.updatedAt - r.createdAt) / 86400000, 0) / returns.length).toFixed(1)
          : "0.0"

        const relatedReturnIds = (await ReturnModel.find({ courierPartner: p._id, deletedAt: null }).distinct("_id"))
        const claimsRaised = await ClaimModel.countDocuments({ return: { $in: relatedReturnIds }, deletedAt: null })
        const claimsApproved = await ClaimModel.countDocuments({ return: { $in: relatedReturnIds }, deletedAt: null, status: "approved" })
        const approvalPercent = claimsRaised > 0 ? ((claimsApproved / claimsRaised) * 100).toFixed(1) : "0.0"

        return {
          _id: p._id,
          name: p.name,
          code: p.code,
          reverseShippingCharge: p.reverseShippingCharge,
          avgReturnTimeDays,
          claimsRaised,
          approvalPercent,
        }
      })
    )

    return response(true, 200, "Courier partners fetched.", withStats)
  } catch (error) {
    return catchError(error, "Failed to fetch courier partners.")
  }
}