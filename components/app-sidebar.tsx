"use client"

import type * as React from "react"
import { Calendar, Settings, Users, Menu, Home, LogOut, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { getFirebaseInstances } from "@/lib/firebase"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Shows Line Up",
    url: "/shows",
    icon: Menu,
  },
  {
    title: "Events",
    url: "/events",
    icon: Calendar,
  },
  {
    title: "Presenters",
    url: "/presenters",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<"aside">) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const openLogoutDialog = () => {
    setLogoutError(null)
    setIsLogoutDialogOpen(true)
  }

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setLogoutError(null)

    try {
      console.log("🔐 Logging out...")
      const { auth } = await getFirebaseInstances()
      await auth.signOut()
      console.log("✅ Logout successful")
      setIsLogoutDialogOpen(false)
      router.push("/")
    } catch (error) {
      console.error("❌ Logout error:", error)
      setLogoutError("Logout failed. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className="w-64 bg-radio-black border-r-0 flex flex-col" {...props}>
      {/* Header */}
      <div className="p-6">
        <div className="flex flex-col items-start space-y-4">
          <div className="bg-white/5 p-2 rounded-lg">
            <Image
              src="/images/zibonele-logo.png"
              alt="Zibonele Radio Logo"
              width={140}
              height={60}
              className="object-contain"
            />
          </div>
          <div className="text-white/70 text-sm">Welcome, Demo User</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-white hover:bg-radio-gray/20 transition-colors ${
                pathname === item.url ? "bg-radio-gold text-radio-black" : ""
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}

          {/* Logout item under Settings */}
          <button
            type="button"
            onClick={openLogoutDialog}
            className="mt-2 flex w-full items-center space-x-3 px-3 py-2 rounded-md text-radio-red hover:bg-radio-red/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={(open) => !isLoggingOut && setIsLogoutDialogOpen(open)}>
        <DialogContent className="bg-radio-black border-radio-gold text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to log out of the dashboard? You will need to log in again to access your content.
            </DialogDescription>
          </DialogHeader>

          {logoutError && (
            <Alert className="mb-4 border-radio-red/50 bg-radio-red/10">
              <AlertCircle className="h-4 w-4 text-radio-red" />
              <AlertDescription className="text-radio-red font-medium">
                {logoutError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmLogout}
              className="flex-1 bg-radio-gold text-radio-black hover:bg-radio-gold/90"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </aside>
  )
}
