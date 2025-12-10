"use client"

interface DashboardHeaderProps {
  title?: string;
  text?: string;
  userName?: string;
}

export function DashboardHeader({ 
  title = "Dashboard", 
  text,
  userName = "User" 
}: DashboardHeaderProps) {
  return (
    <div className="space-y-1">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6 bg-radio-gray/20">
        <h1 className="text-2xl font-semibold text-white">
          {title}
          {title === "Dashboard" ? `, ${userName}` : ""}
        </h1>
      </header>
      {text && (
        <p className="px-6 text-sm text-gray-400">
          {text}
        </p>
      )}
    </div>
  )
}
