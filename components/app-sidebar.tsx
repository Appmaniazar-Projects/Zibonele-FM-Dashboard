"use client"

import type * as React from "react"
import { Calendar, Settings, Users, LogOut, Menu, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { firebaseAuth } from "@/lib/firebase"

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
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return

    setIsLoggingOut(true)

    try {
      console.log("🔐 Logging out...")
      await firebaseAuth.signOut()
      console.log("✅ Logout successful")
    } catch (error) {
      console.error("❌ Logout error:", error)
      alert("Logout failed. Please try again.")
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
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-radio-gray/20 rounded-md w-full transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
