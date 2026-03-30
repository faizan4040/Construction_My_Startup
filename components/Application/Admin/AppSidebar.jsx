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
import { LucideChevronRight } from "lucide-react"
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";

import { adminAppSidebarMenu } from "@/lib/adminSidebarMenu"
import { IMAGES } from "@/routes/AllImages"

const AppSidebar = () => {
  const {toggleSidebar} = useSidebar()
  return (
    <Sidebar className="z-50">
      {/* ================= HEADER ================= */}
      <SidebarHeader className="border-b h-14 p-0 bg-gray-800">
        <div className="flex justify-between items-center px-4 h-full">
          <img
            src={IMAGES.dashboardlogo}
            alt="Logo"
            className="block dark:hidden w-33 h-9"
          />

          <img
            src={IMAGES.dashboardlogo}
            alt="Logo Dark"
            className="hidden dark:block w-auto h-10"
          />

          <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden text-white">
            <TbLayoutSidebarLeftExpandFilled />
          </Button>
        </div>
      </SidebarHeader>

      {/* ================= CONTENT ================= */}
      <SidebarContent className="p-3 bg-gray-800">
        <SidebarMenu className="text-gray-300">
          {adminAppSidebarMenu.map((menu, index) => {
            const Icon = menu.icon

            return (
              <Collapsible key={index} className="group/collapsible">
                <SidebarMenuItem>
                  {/* ===== Main Menu Trigger ===== */}
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      className="
                        font-semibold px-2 py-5
                        transition-colors duration-200
                        hover:bg-gray-300
                      "
                    >
                      <Link
                        href={menu.url ?? "#"}
                        className="flex items-center gap-2 w-full"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{menu.title}</span>

                        {menu.submenu?.length > 0 && (
                          <LucideChevronRight
                            className="
                              ml-auto
                              transition-transform duration-300 ease-in-out
                              group-data-[state=open]/collapsible:rotate-90
                              hover:text-gray-300
                            "
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  {/* ===== Sub Menu (Smooth) ===== */}
                  {menu.submenu?.length > 0 && (
                    <CollapsibleContent
                      className="
                        overflow-hidden
                        data-[state=open]:animate-collapsible-down
                        data-[state=closed]:animate-collapsible-up hover:text-gray-300
                      "
                    >
                      <SidebarMenuSub className="pl-4">
                        {menu.submenu.map((submenuItem, subIndex) => (
                          <SidebarMenuSubItem key={subIndex}>
                            <SidebarMenuSubButton
                              asChild
                              className="
                                px-2 py-4 text-gray-300
                                transition-colors duration-200
                                hover:bg-gray-700 hover:text-gray-300
                              " 
                            >
                              <Link href={submenuItem.url}>
                                {submenuItem.title}
                              </Link>
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

export default AppSidebar
