import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Tags,
  ListTree,
  ShoppingCart,
  Wallet,
} from "lucide-react"

import {
  SHOP_OWNER_DASHBOARD,
  SHOP_OWNER_PRODUCT_ADD,
  SHOP_OWNER_PRODUCT_SHOW,
  SHOP_OWNER_CATEGORY_ADD,
  SHOP_OWNER_CATEGORY_SHOW,
  SHOP_OWNER_ORDER_SHOW,
  SHOP_OWNER_MANUAL_ORDER_SHOW,
} from "@/routes/ShopOwnerPanelRoute"

export const shopOwnerSidebarMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: SHOP_OWNER_DASHBOARD,
    submenu: [],
  },
  {
    title: "Products",
    icon: Package,
    url: SHOP_OWNER_PRODUCT_SHOW,
    submenu: [
      { title: "All Products", url: SHOP_OWNER_PRODUCT_SHOW },
      { title: "Add Product", url: SHOP_OWNER_PRODUCT_ADD },
    ],
  },
  {
    title: "Variants",
    icon: PackagePlus,
    url: "/shop/product-variant",
    submenu: [
      { title: "All Variants", url: "/shop/product-variant" },
      { title: "Add Variant", url: "/shop/product-variant/add" },
    ],
  },
  {
    title: "Categories",
    icon: ListTree,
    url: SHOP_OWNER_CATEGORY_SHOW,
    submenu: [
      { title: "All Categories", url: SHOP_OWNER_CATEGORY_SHOW },
      { title: "Add Category", url: SHOP_OWNER_CATEGORY_ADD },
    ],
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    url: SHOP_OWNER_ORDER_SHOW,
    submenu: [
      { title: "All Orders", url: SHOP_OWNER_ORDER_SHOW },
      { title: "Manual Order", url: SHOP_OWNER_MANUAL_ORDER_SHOW },   // NEW
    ],
  },
  {
    title: "Earnings",
    icon: Wallet,
    url: "/shop/earnings",
    submenu: [],
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