import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import './App.css'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import MainIntro from "@/components/main-intro.tsx"
import { ProfessionalSection } from "@/components/professional-section"
import { UserSection } from "@/components/user-section"
import { UserProvider } from "@/context/UserContext"
import { AnimatePresence, motion } from "framer-motion"

function AnimatedRoutes() {
  const location = useLocation()

  return (
      <AnimatePresence mode="wait">
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="h-full"
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MainIntro />} />
            <Route path="/professional" element={<ProfessionalSection />}/>
            <Route path="/user" element={<UserSection />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
  )
}

function App() {
  return (
      <UserProvider>
        <Router>
          <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
              <SiteHeader />
              <div className="flex flex-1 overflow-hidden">
                <AppSidebar />
                <SidebarInset>
                  <AnimatedRoutes />
                </SidebarInset>
              </div>
            </SidebarProvider>
          </div>
        </Router>
      </UserProvider>
  )
}

export default App
