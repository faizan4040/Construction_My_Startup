import { isAuthenticated } from "@/lib/authentication";
import { orderNotification } from "@/email/orderNotification";
import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import z from "zod";

// Product document me se pehli image nikalta hai (field name alag ho to yahan badlo)
const pickImage = (p) => {
    if (!p) return "";
    const first = (v) => (Array.isArray(v) ? v[0] : v);
    const pick = (v) => {
        const x = first(v);
        if (!x) return "";
        if (typeof x === "string") return x;
        return x.secure_url || x.url || x.src || "";
    };
    return pick(p.images) || pick(p.media) || pick(p.image) || pick(p.thumbnail) || "";
};

export async function POST(request) {
    try {

        await connectDB()
        const auth = await isAuthenticated('customer')
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
            pincode: true, landmark: true, ordernote: true
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
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error })
        }

        const validateData = validate.data

        // payment verification
        const verification = validatePaymentVerification({
            order_id: validateData.razorpay_order_id,
            payment_id: validateData.razorpay_payment_id,
        }, validateData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)

        let paymentVerification = false
        if (verification) {
            paymentVerification = true
        }

        const initialStatus = paymentVerification ? 'on_hold' : 'unverified'

        const productIds = validateData.products.map((p) => p.productId)

        // image bhi chahiye (mail ke liye), isliye select me image fields jode
        const productsInfo = await ProductModel.find({ _id: { $in: productIds } })
            .select("isReturnable images media image thumbnail")

        const returnableMap = {}
        const imageMap = {}
        productsInfo.forEach((p) => {
            returnableMap[p._id.toString()] = p.isReturnable !== false
            imageMap[p._id.toString()] = pickImage(p)
        })

        const productsWithStatus = validateData.products.map((item) => ({
            ...item,
            status: initialStatus,
            isReturnable: returnableMap[item.productId] ?? true,
        }))

        const newOrder = await OrderModel.create({
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
            products: productsWithStatus,
            subtotal: validateData.subtotal,
            discount: validateData.discount,
            couponDiscount: validateData.couponDiscount || 0,
            totalAmount: validateData.totalAmount,
            payment_id: validateData.razorpay_payment_id,
            order_id: validateData.razorpay_order_id,
            status: initialStatus,
            paymentStatus: paymentVerification ? 'Paid' : 'Failed'
        });

        // nearest-shop assignment (sirf payment-verified orders ke liye)
        if (paymentVerification) {
            try {
                const { geocodeAddress } = await import("@/lib/geocode")
                const { assignAllItems } = await import("@/lib/itemAssignment")

                const fullAddress = `${validateData.address}, ${validateData.city}, ${validateData.state} ${validateData.pincode}, India`
                const coords = await geocodeAddress(fullAddress)

                if (coords) {
                    newOrder.customerLocation = coords
                    newOrder.deliveryLocation = { type: "Point", coordinates: [coords.lng, coords.lat] }
                    await newOrder.save()
                    await assignAllItems(newOrder._id)
                }
            } catch (assignError) {
                console.error("Shop assignment failed:", assignError)
            }
        }

        /* ---------- Order confirmation + bill mail (sirf verified payment par) ---------- */
        if (paymentVerification) {
            try {
                const html = orderNotification({
                    order_id: validateData.razorpay_order_id,
                    orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${validateData.razorpay_order_id}`,
                    customerName: validateData.name,
                    orderDate: newOrder.createdAt,
                    paymentMethod: "Online",
                    paymentStatus: "Paid",
                    items: validateData.products.map((p) => ({
                        name: p.name,
                        image: imageMap[p.productId] || "",
                        qty: p.qty,
                        price: p.sellingPrice,
                        mrp: p.mrp,
                    })),
                    subTotal: validateData.subtotal,
                    discount: validateData.couponDiscount || 0,
                    total: validateData.totalAmount,
                    address: {
                        name: validateData.name,
                        line1: validateData.address,
                        line2: validateData.landmark,
                        city: validateData.city,
                        state: validateData.state,
                        country: validateData.country,
                        pincode: validateData.pincode,
                        phone: validateData.phone,
                    },
                })

                const mail = await sendMail(
                    `Order Confirmed - ${validateData.razorpay_order_id}`,
                    validateData.email,
                    html
                )

                if (!mail.success) {
                    console.error("Order mail failed:", mail.message)
                }
            } catch (mailError) {
                console.error("Order mail error:", mailError)
            }
        }

        return response(true, 200, 'Order placed successfully.')

    } catch (error) {
        return catchError(error)
    }
}
















// import { isAuthenticated } from "@/lib/authentication";
// import { orderNotification } from "@/email/orderNotification";
// import connectDB from "@/lib/databaseConnection";
// import { catchError, response } from "@/lib/helperfunction";
// import { sendMail } from "@/lib/sendMail";
// import { zSchema } from "@/lib/zodSchema";
// import OrderModel from "@/models/Order.model";
// import ProductModel from "@/models/Product.model";
// import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
// import z from "zod";

// export async function POST(request) {
//     try{
       
//     await connectDB()
//     const auth = await isAuthenticated('customer')
//     const payload = await request.json()

//     const productSchema = z.object({
//         productId: z.string().length(24, 'Invalid product id format'),
//         variantId: z.string().length(24, 'Invalid variant id format'),
//         name: z.string().min(1),
//         qty: z.number().min(1),
//         mrp: z.number().nonnegative(),
//         sellingPrice: z.number().nonnegative()
//     })

//     const orderSchema = zSchema.pick({
//         name: true, email: true, phone: true, address: true, country: true, state: true, city: true,
//         pincode: true, landmark:true, ordernote: true
//     }).extend({
//         userId: z.string().optional(),
//         razorpay_payment_id: z.string().min(3, 'Payment id is required.'),
//         razorpay_order_id: z.string().min(3, 'Order id is required.'),
//         razorpay_signature: z.string().min(3, 'Signature id is required.'),
//         subtotal: z.number().nonnegative(),
//         discount: z.number().nonnegative(),
//         couponDiscount: z.number().nonnegative(),
//         totalAmount: z.number().nonnegative(),
//         products: z.array(productSchema)
//     })

//     const validate = orderSchema.safeParse(payload)
//     if(!validate.success) {
//         return response(false, 400, 'Invalid or missing fields.', {error: validate.error})
//     }


//     const validateData = validate.data 

//     // payment verification
//     const verification = validatePaymentVerification({
//         order_id: validateData.razorpay_order_id,
//         payment_id: validateData.razorpay_payment_id,
//     },validateData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)

//     let paymentVerification = false
//     if(verification) {
//         paymentVerification = true
//     }

//     const initialStatus = paymentVerification ? 'on_hold' : 'unverified'

//     const productIds = validateData.products.map((p) => p.productId)
//     const productsInfo = await ProductModel.find({ _id: { $in: productIds } }).select("isReturnable")
//     const returnableMap = {}
//     productsInfo.forEach((p) => { returnableMap[p._id.toString()] = p.isReturnable !== false })

//     const productsWithStatus = validateData.products.map((item) => ({
//         ...item,
//         status: initialStatus,
//         isReturnable: returnableMap[item.productId] ?? true,
//     }))

//     const newOrder = await OrderModel.create({
//     user: auth.isAuth ? auth.userId : null,                      
//     name: validateData.name,
//     email: validateData.email,
//     phone: validateData.phone,
//     address: validateData.address,
//     country: validateData.country,
//     state: validateData.state,
//     city: validateData.city,
//     pincode: validateData.pincode,
//     landmark: validateData.landmark,
//     ordernote: validateData.ordernote,
//     products: productsWithStatus,
//     subtotal: validateData.subtotal,
//     discount: validateData.discount,
//     couponDiscount: validateData.couponDiscount || 0,  
//     totalAmount: validateData.totalAmount,
//     payment_id: validateData.razorpay_payment_id,
//     order_id: validateData.razorpay_order_id,               
//     status: initialStatus,
//     paymentStatus: paymentVerification ? 'Paid' : 'Failed'
//     });

//     // ✅ NEW — nearest-shop assignment (sirf payment-verified orders ke liye)
//     if (paymentVerification) {
//         try {
//             const { geocodeAddress } = await import("@/lib/geocode")
//             const { assignAllItems } = await import("@/lib/itemAssignment")

//             const fullAddress = `${validateData.address}, ${validateData.city}, ${validateData.state} ${validateData.pincode}, India`
//             const coords = await geocodeAddress(fullAddress)

//             if (coords) {
//                 newOrder.customerLocation = coords
//                 newOrder.deliveryLocation = { type: "Point", coordinates: [coords.lng, coords.lat] }
//                 await newOrder.save()
//                 await assignAllItems(newOrder._id)
//             }
//             // geocode fail ho jaaye to bhi order ban chuka hai — sirf shop-assignment
//             // skip hogi, admin baad me manually assign kar sakta hai
//         } catch (assignError) {
//             console.error("Shop assignment failed:", assignError)
//             // checkout fail nahi hona chahiye isliye — order already ban chuka hai
//         }
//     }

//     try{
//         const mailData = {
//             order_id: validateData.razorpay_order_id,
//             orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${validateData.razorpay_order_id}`
//         }

//         await sendMail('Order placed successfully.', validateData.email, orderNotification(mailData))

//     } catch(error){
    
//     }

//     return response(true, 200, 'Order placed successfully.')
       
//     } catch(error) {
//        return catchError(error)
//     }
// }