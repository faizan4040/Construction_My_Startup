import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { verifyIFSC, createRazorpayContact, createFundAccount } from "@/lib/razorpayX"
import ShopModel from "@/models/Shop.model"
import UserModel from "@/models/User.model"
import z from "zod"

const bankSchema = z.object({
  accountHolderName: z.string().min(2, "Account holder name is required."),
  accountNumber: z.string().min(6).max(20),
  confirmAccountNumber: z.string(),
  ifsc: z.string().length(11, "IFSC code must be 11 characters."),
}).refine((d) => d.accountNumber === d.confirmAccountNumber, {
  message: "Account numbers do not match.",
  path: ["confirmAccountNumber"],
})

export async function POST(request) {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const validated = bankSchema.safeParse(await request.json())
    if (!validated.success) return response(false, 400, "Invalid or missing fields.", validated.error)

    const { accountHolderName, accountNumber, ifsc } = validated.data

    // ── Real-time verification — koi hardcoded/fake bank naam nahi ──
    const ifscCheck = await verifyIFSC(ifsc)
    if (!ifscCheck.valid) return response(false, 400, "Invalid IFSC code. Please enter correct details.")

    const shop = await ShopModel.findById(user.shop)
    if (!shop) return response(false, 404, "Shop not found.")

    let contactId = shop.razorpayContactId
    if (!contactId) {
      const contact = await createRazorpayContact({ name: shop.name, referenceId: String(shop._id) })
      contactId = contact.id
    }

    const fundAccount = await createFundAccount({ contactId, accountHolderName, accountNumber, ifsc })

    shop.bankDetails = { accountHolderName, accountNumber, ifsc: ifsc.toUpperCase() }
    shop.razorpayContactId = contactId
    shop.razorpayFundAccountId = fundAccount.id
    shop.kycStatus = "verified"
    await shop.save()

    return response(true, 200, `Bank account added. Bank: ${ifscCheck.bank}, ${ifscCheck.branch}`)
  } catch (error) {
    return catchError(error, "Failed to add bank account. Please check your details.")
  }
}

export async function GET() {
  try {
    const auth = await isAuthenticated("shop owner")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")

    await connectDB()
    const user = await UserModel.findOne({ _id: auth.userId, deletedAt: null }).select("shop")
    if (!user?.shop) return response(false, 400, "No shop linked.")

    const shop = await ShopModel.findById(user.shop).select("bankDetails kycStatus")
    if (!shop?.bankDetails?.accountNumber) return response(true, 200, "No bank account yet.", null)

    const acc = shop.bankDetails.accountNumber
    return response(true, 200, "Bank account fetched.", {
      accountHolderName: shop.bankDetails.accountHolderName,
      accountNumber: acc.length > 4 ? `••••${acc.slice(-4)}` : acc,
      ifsc: shop.bankDetails.ifsc,
      kycStatus: shop.kycStatus,
    })
  } catch (error) {
    return catchError(error, "Failed to fetch bank account.")
  }
}