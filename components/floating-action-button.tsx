"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-radio-gold hover:bg-radio-gold/90 text-radio-black shadow-lg"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
