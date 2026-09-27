import ShopModel from "@/models/Shop.model"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import OrderModel from "@/models/Order.model"
import NotificationModel from "@/models/Notification.model"

const START_RADIUS_KM = 3
const RADIUS_STEP_KM = 3
const MAX_RADIUS_KM = 21
const ACCEPT_TIMEOUT_MINUTES = 2

function attributesMatch(a = [], b = []) {
  if (a.length !== b.length) return false
  const norm = (arr) => arr.map((x) => `${x.label}:${x.value}`).sort().join("|")
  return norm(a) === norm(b)
}

// Nearest shop dhoondo jiske paas SAME masterProduct ka listing ho, aur
// उसके variant me SAME attributes (Size/Weight/Color) + kaafi stock ho.
async function findNearestSiblingShop(item, customerCoords, radiusKm, excludeShopIds) {
  const originalVariant = await ProductVariantModel.findById(item.variantId).select("attributes")
  if (!originalVariant) return null

  const originalProduct = await ProductModel.findById(item.productId).select("masterProductId")
  if (!originalProduct) return null

  const masterId = originalProduct.masterProductId || originalProduct._id

  const siblingProducts = await ProductModel.find({
    $or: [{ _id: masterId }, { masterProductId: masterId }],
    deletedAt: null,
  }).select("shop name")

  const candidateShopIds = [...new Set(siblingProducts.map((p) => String(p.shop)))]

  // top-5 nearest shops try karenge (kyunki sabse nearest ke paas stock na ho sakta hai)
  const nearbyShops = await ShopModel.find({
    _id: { $in: candidateShopIds, $nin: excludeShopIds },
    isOnline: true,
    isAvailable: true,
    deletedAt: null,
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: customerCoords },
        $maxDistance: radiusKm * 1000,
      },
    },
  }).limit(5)

  for (const shop of nearbyShops) {
    const siblingProduct = siblingProducts.find((p) => String(p.shop) === String(shop._id))
    if (!siblingProduct) continue

    const matchingVariant = await ProductVariantModel.findOne({
      product: siblingProduct._id,
      deletedAt: null,
      stock: { $gte: item.qty },
    })

    if (matchingVariant && attributesMatch(matchingVariant.attributes, originalVariant.attributes)) {
      return { shop, product: siblingProduct, variant: matchingVariant }
    }
  }
  return null
}

export async function assignItemToNearestShop(orderId, itemId) {
  const order = await OrderModel.findById(orderId)
  if (!order) throw new Error("Order not found")

  const item = order.products.id(itemId)
  if (!item) throw new Error("Item not found")

  const excludeShopIds = item.itemAssignment?.attemptedShops || []
  let radius = item.itemAssignment?.currentRadiusKm || START_RADIUS_KM

  let result = null
  while (!result && radius <= MAX_RADIUS_KM) {
    result = await findNearestSiblingShop(item, order.deliveryLocation.coordinates, radius, excludeShopIds)
    if (!result) radius += RADIUS_STEP_KM
  }

  if (!result) {
    item.itemAssignment.status = "escalated"
    item.itemAssignment.currentRadiusKm = radius
    await order.save()

    if (order.adminUserId) {
      await NotificationModel.create({
        user: order.adminUserId,
        type: "escalation",
        title: "Manual assignment needed",
        message: `Order #${order.order_id} me "${item.name}" ke liye ${MAX_RADIUS_KM}km radius me koi shop available nahi. Manually assign karein.`,
        order: order._id,
        link: `/admin/orders/${order.order_id}`,
      })
    }
    return { status: "escalated" }
  }

  const { shop, product, variant } = result
  const expiresAt = new Date(Date.now() + ACCEPT_TIMEOUT_MINUTES * 60 * 1000)

  // ✅ item ka routing is shop ke listing pe switch — customer-facing price (mrp/sellingPrice)
  // WAISI HI rehti hai jo checkout pe quote hui thi, sirf fulfillment-shop badalta hai
  item.productId = product._id
  item.variantId = variant._id

  item.itemAssignment.status = "pending"
  item.itemAssignment.currentShop = shop._id
  item.itemAssignment.currentRadiusKm = radius
  item.itemAssignment.notifiedAt = new Date()
  item.itemAssignment.expiresAt = expiresAt
  item.itemAssignment.attemptedShops.push(shop._id)
  await order.save()

  await NotificationModel.create({
    user: shop.owner,
    type: "delivery_assignment",
    title: "New Order Nearby!",
    message: `Order #${order.order_id} me "${item.name}" ke liye aap nearest shop hain (~${radius}km). ${ACCEPT_TIMEOUT_MINUTES} min me accept karein.`,
    order: order._id,
    link: `/shop/orders/${order.order_id}`,
    expiresAt,
  })

  return { status: "pending", shopId: shop._id, expiresAt }
}

export async function assignAllItems(orderId) {
  const order = await OrderModel.findById(orderId)
  if (!order) return []
  const results = []
  for (const item of order.products) {
    results.push(await assignItemToNearestShop(orderId, item._id))
  }
  return results
}

export async function reassignExpiredItems() {
  const now = new Date()
  const orders = await OrderModel.find({
    products: {
      $elemMatch: { "itemAssignment.status": "pending", "itemAssignment.expiresAt": { $lte: now } },
    },
  })

  const results = []
  for (const order of orders) {
    for (const item of order.products) {
      if (item.itemAssignment?.status === "pending" && item.itemAssignment.expiresAt <= now) {
        await NotificationModel.updateMany({ order: order._id, isRead: false }, { isRead: true })
        results.push(await assignItemToNearestShop(order._id, item._id))
      }
    }
  }
  return results
}