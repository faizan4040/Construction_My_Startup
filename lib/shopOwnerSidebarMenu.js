import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingCart,
  Wallet,
  RotateCcw,
  Boxes,
  UploadCloud,
  ImagePlus,
  CreditCard,
  Megaphone,
  BadgePercent,
  TrendingUp,
  Sparkles,
  BarChart3,
  Gauge,
} from "lucide-react"

import {
  SHOP_OWNER_DASHBOARD,
  SHOP_OWNER_PRODUCT_ADD,
  SHOP_OWNER_PRODUCT_SHOW,
  SHOP_OWNER_ORDER_SHOW,
  SHOP_OWNER_MANUAL_ORDER_SHOW,
  SHOPOWNER_TRACK_EARNING,
  SHOP_OWNER_TODO_SHOW,
} from "@/routes/ShopOwnerPanelRoute"

// NOTE: replace these hardcoded strings with real constants from
// ShopOwnerPanelRoute once you add them there.
export const shopOwnerSidebarMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    iconColor: "text-blue-400",
    url: SHOP_OWNER_DASHBOARD,
    submenu: [],
  },
  {
    title: "Products",
    icon: Package,
    iconColor: "text-emerald-400",
    submenu: [
      { title: "All Products", url: SHOP_OWNER_PRODUCT_SHOW },
      { title: "Add Product", url: SHOP_OWNER_PRODUCT_ADD },
    ],
  },
  {
    title: "Variants",
    icon: PackagePlus,
    iconColor: "text-purple-400",
    submenu: [
      { title: "All Variants", url: "/shop/product-variant" },
      { title: "Add Variant", url: "/shop/product-variant/add" },
    ],
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    iconColor: "text-orange-400",
    submenu: [
      { title: "All Orders", url: SHOP_OWNER_ORDER_SHOW },
      { title: "Manual Order", url: SHOP_OWNER_MANUAL_ORDER_SHOW },
    ],
  },
  {
    title: "Returns",
    icon: RotateCcw,
    iconColor: "text-red-400",
    url: "/shop/returns",
    submenu: [],
  },
  {
    title: "Inventory",
    icon: Boxes,
    iconColor: "text-amber-400",
    url: "/shop/inventory",
    submenu: [],
  },
  {
    title: "Catalog Upload",
    icon: UploadCloud,
    iconColor: "text-cyan-400",
    url: "/shop/catalog-upload",
    submenu: [],
  },
  {
    title: "Image Bulk Upload",
    icon: ImagePlus,
    iconColor: "text-pink-400",
    url: "/shop/image-bulk-upload",
    submenu: [],
  },
  {
    title: "Payments",
    icon: CreditCard,
    iconColor: "text-green-400",
    url: "/shop/payments",
    submenu: [],
  },
  {
    title: "Earnings",
    icon: Wallet,
    iconColor: "text-yellow-400",
    url: SHOPOWNER_TRACK_EARNING,
    submenu: [],
  },

  // ---- Section heading ----
  { type: "heading", title: "Boost Sales" },

  {
    title: "Advertisement",
    icon: Megaphone,
    iconColor: "text-fuchsia-400",
    url: "/shop/advertisement",
    submenu: [],
  },
  {
    title: "Promotions",
    icon: BadgePercent,
    iconColor: "text-rose-400",
    url: "/shop/promotions",
    submenu: [],
  },
  {
    title: "Price Recommendation",
    icon: TrendingUp,
    iconColor: "text-lime-400",
    url: "/shop/price-recommendation",
    submenu: [],
  },
  {
    title: "Product Recommendation",
    icon: Sparkles,
    iconColor: "text-indigo-400",
    url: "/shop/product-recommendation",
    submenu: [],
  },

  // ---- Section heading ----
  { type: "heading", title: "Performance" },

  {
    title: "Business Dashboard",
    icon: BarChart3,
    iconColor: "text-sky-400",
    url: "/shop/business-dashboard",
    submenu: [],
  },
  {
    title: "Quality Dashboard",
    icon: Gauge,
    iconColor: "text-teal-400",
    url: "/shop/quality-dashboard",
    submenu: [],
  },


  {
     title: "Todo",
     url: SHOP_OWNER_TODO_SHOW,
     icon: LuListTodo,
  },


]






















// import { MdSpaceDashboard, MdOutlinePermMedia, MdOutlineInventory2 } from "react-icons/md"
// import { BiCategory } from "react-icons/bi"
// import { IoShirtOutline } from "react-icons/io5"
// import { TbPaperBag } from "react-icons/tb"
// import { GoPeople } from "react-icons/go"
// import { CiStar } from "react-icons/ci"
// import { RiCoupon2Fill, RiChatSmile2Line } from "react-icons/ri"
// import { LuListTodo } from "react-icons/lu"

// import {
//   SHOP_OWNER_DASHBOARD,
//   SHOP_OWNER_PRODUCT_ADD,
//   SHOP_OWNER_PRODUCT_SHOW,
//   SHOP_OWNER_CATEGORY_ADD,
//   SHOP_OWNER_CATEGORY_SHOW,
//   SHOP_OWNER_ORDER_SHOW,
//   SHOP_OWNER_COUPON_ADD,
//   SHOP_OWNER_COUPON_SHOW,
//   SHOP_OWNER_REVIEW_SHOW,
//   SHOP_OWNER_STOCK_SHOW,
//   SHOP_OWNER_WAREHOUSE_SHOW,
//   SHOP_OWNER_MEDIA_SHOW,
//   SHOP_OWNER_CHAT_SHOW,
//   SHOP_OWNER_TODO_SHOW,
//   SHOP_OWNER_CUSTOMERS_SHOW,
// } from "@/routes/ShopOwnerPanelRoute"

// export const shopOwnerSidebarMenu = [
//   {
//     title: "Dashboard",
//     url: SHOP_OWNER_DASHBOARD,
//     icon: MdSpaceDashboard,
//   },
//   {
//     title: "Product",
//     url: "#",
//     icon: IoShirtOutline,
//     submenu: [
//       { title: "Add Product", url: SHOP_OWNER_PRODUCT_ADD },
//       { title: "All Products", url: SHOP_OWNER_PRODUCT_SHOW },
//     ],
//   },
//   {
//     title: "Category",
//     url: "#",
//     icon: BiCategory,
//     submenu: [
//       { title: "Add Category", url: SHOP_OWNER_CATEGORY_ADD },
//       { title: "All Category", url: SHOP_OWNER_CATEGORY_SHOW },
//     ],
//   },
//   {
//     title: "Inventory",
//     url: "#",
//     icon: MdOutlineInventory2,
//     submenu: [
//       { title: "WareHouse", url: SHOP_OWNER_WAREHOUSE_SHOW },
//       { title: "Stock", url: SHOP_OWNER_STOCK_SHOW },
//     ],
//   },
//   {
//     title: "Coupons",
//     url: "#",
//     icon: RiCoupon2Fill,
//     submenu: [
//       { title: "Add Coupon", url: SHOP_OWNER_COUPON_ADD },
//       { title: "All Coupons", url: SHOP_OWNER_COUPON_SHOW },
//     ],
//   },
//   {
//     title: "Orders",
//     url: SHOP_OWNER_ORDER_SHOW,
//     icon: TbPaperBag,
//   },
//   {
//     title: "Customers",
//     url: SHOP_OWNER_CUSTOMERS_SHOW,
//     icon: GoPeople,
//   },
//   {
//     title: "Rating & Review",
//     url: SHOP_OWNER_REVIEW_SHOW,
//     icon: CiStar,
//   },
//   {
//     title: "Media",
//     url: SHOP_OWNER_MEDIA_SHOW,
//     icon: MdOutlinePermMedia,
//   },
//   {
//     title: "Chat",
//     url: SHOP_OWNER_CHAT_SHOW,
//     icon: RiChatSmile2Line,
//   },
//   {
//     title: "Todo",
//     url: SHOP_OWNER_TODO_SHOW,
//     icon: LuListTodo,
//   },
// ]