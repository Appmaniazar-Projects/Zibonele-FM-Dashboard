"use client"

interface DashboardHeaderProps {
  title?: string
  userName?: string
}

export function DashboardHeader({ title = "Dashboard", userName = "User" }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6 bg-radio-gray/20">
      <h1 className="text-2xl font-semibold text-white">
        {title}
        {title === "Dashboard" ? `, ${userName}` : ""}
      </h1>
    </header>
  )
}
