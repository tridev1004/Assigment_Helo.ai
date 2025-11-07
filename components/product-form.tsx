"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { addProduct, updateProduct } from "@/lib/slices/productSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Product } from "@/lib/slices/productSlice"

const CATEGORIES = ["Electronics", "Appliances", "Furniture", "Books", "Clothing"]

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price || "",
    category: product?.category || CATEGORIES[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0"
    }
    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (product) {
      dispatch(
        updateProduct({
          ...product,
          name: formData.name,
          price: Number(formData.price),
          category: formData.category,
        }),
      )
    } else {
      dispatch(
        addProduct({
          name: formData.name,
          price: Number(formData.price),
          category: formData.category,
        }),
      )
    }

    onClose()
  }

  return (
    <div className="w-full">
      <div className="px-8 py-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
        <div className="mb-8">
          <h3 className="text-2xl font-medium text-foreground">{product ? "edit" : "add"} product</h3>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-foreground uppercase tracking-widest mb-2.5">
              Product Name
            </label>
            <Input
              type="text"
              placeholder="e.g., wireless headphones"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-destructive text-xs mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground uppercase tracking-widest mb-2.5">Price</label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              step="0.01"
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 rounded-lg ${errors.price ? "border-destructive" : ""}`}
            />
            {errors.price && <p className="text-destructive text-xs mt-1.5">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground uppercase tracking-widest mb-2.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 text-sm ${errors.category ? "border-destructive" : ""}`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-destructive text-xs mt-1.5">{errors.category}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 rounded-lg h-10">
              {product ? "update" : "create"} product
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-lg h-10 bg-transparent">
              cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
