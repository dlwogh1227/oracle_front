"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  // AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { LoginForm } from "@/components/login-form"
import { useUser } from "@/context/UserContext"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {useState} from "react"; // 예: shadcn/ui 기준

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, setUser } = useUser()
  const [isModalOpen, setModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include", // 세션 쿠키 포함
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      setUser(null);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  if (!user) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
                size="lg"
                className="text-sm"
                onClick={() => setModalOpen(true)} // 👈 모달 열기
            >
              로그인하기
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 👇 로그인 모달 */}
        <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-sm w-full bg-transparent p-0 shadow-none border-0 rounded-none">
            <LoginForm />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/*<AvatarImage src={user.avatar} alt={user.name} />*/}
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.username}</span>
                {/*<span className="truncate text-xs">{user.email}</span>*/}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                계정
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                알림
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
