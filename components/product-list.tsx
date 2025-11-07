"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { deleteProduct } from "@/lib/slices/productSlice"
import { addToCart } from "@/lib/slices/cartSlice"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, ShoppingCart } from "lucide-react"

interface ProductListProps {
  onEdit: (productId: string) => void
}

export function ProductList({ onEdit }: ProductListProps) {
  const products = useSelector((state: RootState) => state.products.items)
  const dispatch = useDispatch<AppDispatch>()

  const handleDelete = (id: string) => {
    if (confirm("Remove this product from your catalog?")) {
      dispatch(deleteProduct(id))
    }
  }

  const handleAddToCart = () => {
    dispatch(addToCart())
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="text-center max-w-sm">
          <p className="text-lg font-medium text-foreground mb-1">no products yet</p>
          <p className="text-sm text-muted-foreground">start by adding your first product to build your catalog</p>
        </div>
      </div>
    )
  }

  return (
    /* Organic grid with varied spacing and softer edges */
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-col rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-sm transition-all duration-300"
        >
          <div className="px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{product.category}</p>
            <h3 className="text-xl font-medium text-foreground">{product.name}</h3>
          </div>

          <div className="px-6 py-4 flex-1 flex flex-col justify-between border-t border-border/50">
            <div className="mb-8">
              <p className="text-4xl font-medium text-primary tracking-tight">{product.price.toFixed(2)}</p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(product.id)}
                className="flex-1 text-xs h-9 hover:bg-secondary/50"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(product.id)}
                className="flex-1 text-xs h-9 hover:bg-destructive/10 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                remove
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="flex-1 h-9 text-xs bg-accent hover:bg-accent/90 text-accent-foreground gap-1"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                add
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
