import { SidebarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const navigate = useNavigate()

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="ml-auto flex items-center gap-10 text-sm font-medium mr-[8%]">
          <nav className="flex items-center gap-10 text-sm font-medium ml-auto">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/")}>home</span>
            <span className="cursor-pointer hover:text-primary">about</span>
          </nav>
        </div>
      </div>
    </header>
  )
}
