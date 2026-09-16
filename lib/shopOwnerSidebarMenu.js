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
  SHOP_OWNER_RETURN_SHOW,
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
    url: SHOP_OWNER_RETURN_SHOW,
    submenu: [],
  },
  // {
  //   title: "Inventory",
  //   icon: Boxes,
  //   iconColor: "text-amber-400",
  //   url: "/shop/inventory",
  //   submenu: [],
  // },
  // {
  //   title: "Catalog Upload",
  //   icon: UploadCloud,
  //   iconColor: "text-cyan-400",
  //   url: "/shop/catalog-upload",
  //   submenu: [],
  // },
  // {
  //   title: "Image Bulk Upload",
  //   icon: ImagePlus,
  //   iconColor: "text-pink-400",
  //   url: "/shop/image-bulk-upload",
  //   submenu: [],
  // },
  {
    title: "Payments",
    icon: CreditCard,
    iconColor: "text-green-400",
    url: "/shop/payments",
    submenu: [],
  },
  // {
  //   title: "Earnings",
  //   icon: Wallet,
  //   iconColor: "text-yellow-400",
  //   url: SHOPOWNER_TRACK_EARNING,
  //   submenu: [],
  // },


  
  // ---- Section heading ----

  // { type: "heading", title: "Boost Sales" },

  // {
  //   title: "Advertisement",
  //   icon: Megaphone,
  //   iconColor: "text-fuchsia-400",
  //   url: "/shop/advertisement",
  //   submenu: [],
  // },
  // {
  //   title: "Promotions",
  //   icon: BadgePercent,
  //   iconColor: "text-rose-400",
  //   url: "/shop/promotions",
  //   submenu: [],
  // },
  // {
  //   title: "Price Recommendation",
  //   icon: TrendingUp,
  //   iconColor: "text-lime-400",
  //   url: "/shop/price-recommendation",
  //   submenu: [],
  // },
  // {
  //   title: "Product Recommendation",
  //   icon: Sparkles,
  //   iconColor: "text-indigo-400",
  //   url: "/shop/product-recommendation",
  //   submenu: [],
  // },

  // ---- Section heading ----
  { type: "heading", title: "Performance" },

  {
    title: "Business Dashboard",
    icon: BarChart3,
    iconColor: "text-sky-400",
    url: "/shop/business-dashboard",
    submenu: [],
  },
  // {
  //   title: "Quality Dashboard",
  //   icon: Gauge,
  //   iconColor: "text-teal-400",
  //   url: "/shop/quality-dashboard",
  //   submenu: [],
  // },

]


