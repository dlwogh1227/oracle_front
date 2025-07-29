import * as React from "react"
import {
  Bot,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "일반 사용자용",
      url: "#/user",
      icon: SquareTerminal,
      isActive: false,
    },
    {
      title: "의사용",
      url: "#/professional",
      icon: Bot,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
