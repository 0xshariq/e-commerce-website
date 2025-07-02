import {
  User,
  Settings,
  ShoppingCart,
  Heart,
  MapPin,
  Package,
  Store,
  BarChart3,
  Users,
  DollarSign,
  FileText,
  CreditCard,
} from "lucide-react"

export const roleNavConfigs = {
  customer: {
    mainNav: [
      { href: "/", label: "Home" },
      { href: "/products", label: "Products" },
      { href: "/categories", label: "Categories" },
      { href: "/customer/dashboard", label: "My Account" },
    ],
    dropdownItems: [
      { href: "/customer/profile", label: "Profile", icon: User },
      { href: "/customer/orders", label: "My Orders", icon: ShoppingCart },
      { href: "/customer/wishlist", label: "Wishlist", icon: Heart },
      { href: "/customer/addresses", label: "Addresses", icon: MapPin },
      { href: "/customer/settings", label: "Settings", icon: Settings },
    ],
  },
  vendor: {
    mainNav: [
      { href: "/", label: "Home" },
      { href: "/products", label: "Browse Products" },
      { href: "/vendor/dashboard", label: "Dashboard" },
      { href: "/vendor/products", label: "My Products" },
      { href: "/vendor/orders", label: "Orders" },
    ],
    dropdownItems: [
      { href: "/vendor/profile", label: "Profile", icon: User },
      { href: "/vendor/products", label: "My Products", icon: Package },
      { href: "/vendor/products/create", label: "Add Product", icon: Package },
      { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
      { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/vendor/payments", label: "Payments", icon: CreditCard },
      { href: "/vendor/settings", label: "Settings", icon: Settings },
    ],
  },
  admin: {
    mainNav: [
      { href: "/", label: "Home" },
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/vendors", label: "Vendors" },
      { href: "/admin/products", label: "Products" },
    ],
    dropdownItems: [
      { href: "/admin/profile", label: "Profile", icon: User },
      { href: "/admin/users", label: "Manage Users", icon: Users },
      { href: "/admin/vendors", label: "Manage Vendors", icon: Store },
      { href: "/admin/products", label: "Manage Products", icon: Package },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
      { href: "/admin/reports", label: "Reports", icon: FileText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
}

export const defaultNavConfig = {
  mainNav: [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  dropdownItems: [],
}

export function getNavConfig(role?: string) {
  if (!role) return defaultNavConfig
  return roleNavConfigs[role as keyof typeof roleNavConfigs] || defaultNavConfig
}
