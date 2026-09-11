"use client"

import React from "react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { Button } from "@/components/ui/button"
import { LucideChevronRight, Headset } from "lucide-react"
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb"
import { shopOwnerSidebarMenu } from "@/lib/shopOwnerSidebarMenu"
import { IMAGES } from "@/routes/AllImages"

const SidebarTopBar = () => (
  <div className="flex items-center justify-end px-4 py-2 bg-gray-800 border-b border-gray-700">
    <Link
      href="/shop/support"
      className="inline-flex items-center gap-1 text-gray-300 hover:text-white text-xs font-medium"
    >
      <Headset className="h-5 w-5 text-green-400" />
      <span>Support</span>
    </Link>
  </div>
)

const ShopSidebar = () => {
  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar className="z-50">
      <SidebarHeader className="border-b h-14 p-0 bg-gray-800">
        <div className="flex justify-between items-center px-4 h-full">
          <img src={IMAGES.dashboardlogo} alt="Logo" className="block dark:hidden w-35 h-12" />
          <img src={IMAGES.dashboardlogo} alt="Logo Dark" className="hidden dark:block w-auto h-10" />
          <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden text-white">
            <TbLayoutSidebarLeftExpandFilled />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarTopBar />

      <SidebarContent className="p-3 bg-gray-800">
        <SidebarMenu className="text-gray-300">
          {shopOwnerSidebarMenu.map((item, index) => {
            if (item.type === "heading") {
              return (
                <div key={`heading-${index}`} className="mt-4 mb-1 px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-600 pb-1">
                    {item.title}
                  </p>
                </div>
              )
            }

            const Icon = item.icon
            return (
              <Collapsible key={index} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className="font-semibold px-2 py-5 transition-colors duration-200 hover:bg-gray-300"
                    >
                      <Link href={item.url ?? "#"} className="flex items-center gap-2 w-full">
                        <Icon className={`h-4 w-4 ${item.iconColor ?? "text-gray-300"}`} />
                        <span>{item.title}</span>
                        {item.submenu?.length > 0 && (
                          <LucideChevronRight className="ml-auto transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90 hover:text-gray-300" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {item.submenu?.length > 0 && (
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up hover:text-gray-300">
                      <SidebarMenuSub className="pl-4">
                        {item.submenu.map((submenuItem, subIndex) => (
                          <SidebarMenuSubItem key={subIndex}>
                            <SidebarMenuSubButton
                              asChild
                              className="px-2 py-4 text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-gray-300"
                            >
                              <Link href={submenuItem.url}>{submenuItem.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

export default ShopSidebar












// "use client"

// import React, { useEffect, useState } from "react"
// import Link from "next/link"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarMenuSub,
//   SidebarMenuSubButton,
//   SidebarMenuSubItem,
//   useSidebar,
// } from "@/components/ui/sidebar"

// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible"

// import { Button } from "@/components/ui/button"
// import { LucideChevronRight, Bell, Headset } from "lucide-react"
// import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb"
// import { shopOwnerSidebarMenu } from "@/lib/shopOwnerSidebarMenu"
// import { IMAGES } from "@/routes/AllImages"

// // --- Notification bell with live unread-order count -------------------
// // Replace the fetch URL below with your real notifications/orders API.
// // Polls every 30s; swap for a socket/SSE subscription if you have one.
// const NotificationBell = () => {
//   const [count, setCount] = useState(0)

//   useEffect(() => {
//     let isMounted = true

//     const fetchCount = async () => {
//       try {
//         const res = await fetch("/api/shopowner/notifications/orders/count", {
//           credentials: "include",
//         })
//         if (!res.ok) return
//         const data = await res.json()
//         if (isMounted) setCount(data?.count ?? 0)
//       } catch (err) {
//         // fail silently, keep last known count
//       }
//     }

//     fetchCount()
//     const interval = setInterval(fetchCount, 30000)

//     return () => {
//       isMounted = false
//       clearInterval(interval)
//     }
//   }, [])

//   return (
//     <Link href="/shop/notifications" className="relative inline-flex items-center">
//       <Bell className="h-5 w-5 text-yellow-400" />
//       {count > 0 && (
//         <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
//           {count > 99 ? "99+" : count}
//         </span>
//       )}
//     </Link>
//   )
// }

// const SidebarTopBar = () => (
//   <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
//     <NotificationBell />
//     <Link
//       href="/shop/support"
//       className="inline-flex items-center gap-1 text-gray-300 hover:text-white text-xs font-medium"
//     >
//       <Headset className="h-5 w-5 text-green-400" />
//       <span>Support</span>
//     </Link>
//   </div>
// )

// const ShopSidebar = () => {
//   const { toggleSidebar } = useSidebar()

//   return (
//     <Sidebar className="z-50">
//       <SidebarHeader className="border-b h-14 p-0 bg-gray-800">
//         <div className="flex justify-between items-center px-4 h-full">
//           <img src={IMAGES.dashboardlogo} alt="Logo" className="block dark:hidden w-35 h-12" />
//           <img src={IMAGES.dashboardlogo} alt="Logo Dark" className="hidden dark:block w-auto h-10" />
//           <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden text-white">
//             <TbLayoutSidebarLeftExpandFilled />
//           </Button>
//         </div>
//       </SidebarHeader>

//       <SidebarTopBar />

//       <SidebarContent className="p-3 bg-gray-800">
//         <SidebarMenu className="text-gray-300">
//           {shopOwnerSidebarMenu.map((item, index) => {
//             // Section heading (e.g. "Boost Sales", "Performance")
//             if (item.type === "heading") {
//               return (
//                 <div key={`heading-${index}`} className="mt-4 mb-1 px-2">
//                   <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-600 pb-1">
//                     {item.title}
//                   </p>
//                 </div>
//               )
//             }

//             const Icon = item.icon
//             return (
//               <Collapsible key={index} className="group/collapsible">
//                 <SidebarMenuItem>
//                   <CollapsibleTrigger asChild>
//                     <SidebarMenuButton
//                       asChild
//                       className="font-semibold px-2 py-5 transition-colors duration-200 hover:bg-gray-300"
//                     >
//                       <Link href={item.url ?? "#"} className="flex items-center gap-2 w-full">
//                         <Icon className={`h-4 w-4 ${item.iconColor ?? "text-gray-300"}`} />
//                         <span>{item.title}</span>
//                         {item.submenu?.length > 0 && (
//                           <LucideChevronRight className="ml-auto transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90 hover:text-gray-300" />
//                         )}
//                       </Link>
//                     </SidebarMenuButton>
//                   </CollapsibleTrigger>

//                   {item.submenu?.length > 0 && (
//                     <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up hover:text-gray-300">
//                       <SidebarMenuSub className="pl-4">
//                         {item.submenu.map((submenuItem, subIndex) => (
//                           <SidebarMenuSubItem key={subIndex}>
//                             <SidebarMenuSubButton
//                               asChild
//                               className="px-2 py-4 text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-gray-300"
//                             >
//                               <Link href={submenuItem.url}>{submenuItem.title}</Link>
//                             </SidebarMenuSubButton>
//                           </SidebarMenuSubItem>
//                         ))}
//                       </SidebarMenuSub>
//                     </CollapsibleContent>
//                   )}
//                 </SidebarMenuItem>
//               </Collapsible>
//             )
//           })}
//         </SidebarMenu>
//       </SidebarContent>
//     </Sidebar>
//   )
// }

// export default ShopSidebar








