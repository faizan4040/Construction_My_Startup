import { isAuthenticated } from "@/lib/authentication";
import { orderNotification } from "@/email/orderNotification";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import ProductVariantModel from "@/models/ProductVariant.model";
import z from "zod";

export async function POST(request) {
    try{
       
    await connectDB()
    const auth = await isAuthenticated('user')
    const payload = await request.json()

    const productSchema = z.object({
        productId: z.string().length(24, 'Invalid product id format'),
        variantId: z.string().length(24, 'Invalid variant id format'),
        name: z.string().min(1),
        qty: z.number().min(1),
        mrp: z.number().nonnegative(),
        sellingPrice: z.number().nonnegative()
    })

    const orderSchema = zSchema.pick({
        name: true, email: true, phone: true, address: true, country: true, state: true, city: true,
        pincode: true, landmark:true, ordernote: true
    }).extend({
        userId: z.string().optional(),
        razorpay_payment_id: z.string().min(3, 'Payment id is required.'),
        razorpay_order_id: z.string().min(3, 'Order id is required.'),
        razorpay_signature: z.string().min(3, 'Signature id is required.'),
        subtotal: z.number().nonnegative(),
        discount: z.number().nonnegative(),
        couponDiscount: z.number().nonnegative(),
        totalAmount: z.number().nonnegative(),
        products: z.array(productSchema)
    })

    const validate = orderSchema.safeParse(payload)
    if(!validate.success) {
        return response(false, 400, 'Invalid or missing fields.', {error: validate.error})
    }


    const validateData = validate.data 

    // payment verification
    const verification = validatePaymentVerification({
        order_id: validateData.razorpay_order_id,
        payment_id: validateData.razorpay_payment_id,
    },validateData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)

    let paymentVerification = false
    if(verification) {
        paymentVerification = true
    }

    const newOrder = await OrderModel.create({
    // user: validateData.userId || null, 
    user: auth.isAuth ? auth.userId : null,                      
    name: validateData.name,
    email: validateData.email,
    phone: validateData.phone,
    address: validateData.address,
    country: validateData.country,
    state: validateData.state,
    city: validateData.city,
    pincode: validateData.pincode,
    landmark: validateData.landmark,
    ordernote: validateData.ordernote,
    products: validateData.products,
    subtotal: validateData.subtotal,
    discount: validateData.discount,
    couponDiscount: validateData.couponDiscount || 0,  
    totalAmount: validateData.totalAmount,
    payment_id: validateData.razorpay_payment_id,
    order_id: validateData.razorpay_order_id,               
    status: paymentVerification ? 'pending' : 'unverified'
    });

        if (paymentVerification) {
        for (const item of validateData.products) {
            await ProductVariantModel.findOneAndUpdate(
            { _id: item.variantId, stock: { $gte: item.qty } },
            { $inc: { stock: -item.qty } }
            )
        }
        }


    try{
        const mailData = {
            order_id: validateData.razorpay_order_id,
            orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${validateData.razorpay_order_id}`
        }

        await sendMail('Order placed successfully.', validateData.email, orderNotification(mailData))

    } catch(error){
    
    }

    return response(true, 200, 'Order placed successfully.')
       
    } catch(error) {
       return catchError(error)
    }
}