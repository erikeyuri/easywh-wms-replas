import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Branch, Warehouse } from '@/lib/mock-data'

export type UserRole = 'admin' | 'operator'

export type CartItem = {
  productId: string
  sourceAddressId: string
  qty: number
}

interface AppStoreContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  activeBranch: Branch | null
  setActiveBranch: (branch: Branch | null) => void
  activeWarehouse: Warehouse | null
  setActiveWarehouse: (warehouse: Warehouse | null) => void
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  clearCart: () => void
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('admin')
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null)
  const [activeWarehouse, setActiveWarehouse] = useState<Warehouse | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => setCart((prev) => [...prev, item])
  const clearCart = () => setCart([])

  return (
    <AppStoreContext.Provider
      value={{
        role,
        setRole,
        activeBranch,
        setActiveBranch,
        activeWarehouse,
        setActiveWarehouse,
        cart,
        addToCart,
        clearCart,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  )
}

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppStoreProvider')
  }
  return context
}
