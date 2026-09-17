import { verifyIFSC } from "@/lib/razorpayX"
import { response } from "@/lib/helperfunction"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const ifsc = searchParams.get("ifsc")
  if (!ifsc || ifsc.length !== 11) return response(false, 400, "Enter a valid 11-character IFSC.")

  const result = await verifyIFSC(ifsc)
  if (!result.valid) return response(false, 400, "Invalid IFSC code.")

  return response(true, 200, "Valid IFSC.", result)
}