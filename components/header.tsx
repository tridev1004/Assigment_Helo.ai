"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { ShoppingCart } from "lucide-react"

export function Header() {
  const cartCount = useSelector((state: RootState) => state.cart.count)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 max-w-7xl items-center justify-between mx-auto px-6">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold text-foreground">shop.</h1>
          <p className="text-xs text-muted-foreground">your collection</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-full border border-accent/20 hover:border-accent/40 transition-colors">
            <ShoppingCart className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">{cartCount}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
