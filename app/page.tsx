"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { Header } from "@/components/header"
import { ProductForm } from "@/components/product-form"
import { ProductList } from "@/components/product-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import PrimeRangeCalendar from "@/components/calender-comp"

export default function Page() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const products = useSelector((state: RootState) => state.products.items)
  const editingProduct = editingId ? products.find((p) => p.id === editingId) : null

  const handleEdit = (productId: string) => {
    setEditingId(productId)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-12 mb-16">
            <div>
              <h2 className="text-5xl font-medium text-foreground mb-2">your inventory</h2>
              <p className="text-base text-muted-foreground">add, edit, and manage your products</p>
            </div>
            <Button
              onClick={() => {
                setEditingId(null)
                setShowForm(!showForm)
              }}
              className={`self-start lg:self-auto gap-2 transition-all ${showForm ? "bg-card/50 border border-border text-foreground hover:bg-card/70" : "bg-primary hover:bg-primary/90"}`}
              variant={showForm ? "outline" : "default"}
            >
              <Plus className="w-4 h-4" />
              {showForm ? "cancel" : " add product"}
            </Button>
          </div>

          {showForm && (
            <div className="mb-16 max-w-xl">
              <ProductForm product={editingProduct} onClose={handleCloseForm} />
            </div>
          )}

          <PrimeRangeCalendar/>

          <ProductList onEdit={handleEdit} />
        </div>
      </main>
    </>
  )
}
