"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  Package,
  LogOut,
  User,
  Shield,
  Store,
  Users,
  X,
  ChevronDown,
  Bell,
} from "lucide-react"
import { getNavConfig } from "@/lib/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const userRole = (session?.user as any)?.role

  // Get navigation configuration based on user role
  const navConfig = getNavConfig(userRole)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "vendor":
        return <Store className="h-4 w-4" />
      case "customer":
        return <Users className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-50 text-purple-600 border-purple-200"
      case "vendor":
        return "bg-green-50 text-green-600 border-green-200"
      case "customer":
        return "bg-blue-50 text-blue-600 border-blue-200"
      default:
        return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gray-50 px-4 py-2 text-sm border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">🚚 Free shipping on orders over ₹500</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              Customer Care
            </Link>
            <Link href="/faqs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Help & FAQs
            </Link>
            {!session && (
              <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                Become a Seller
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">ShopHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1">
            {navConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search for products, brands and more..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                {/* Role Badge */}
                {userRole && (
                  <Badge variant="outline" className={`hidden sm:flex ${getRoleColor(userRole)}`}>
                    {getRoleIcon(userRole)}
                    <span className="ml-1 capitalize">{userRole}</span>
                  </Badge>
                )}

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Bell className="h-4 w-4" />
                </Button>

                {/* Cart (for customers) */}
                {userRole === "customer" && (
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="relative">
                      <ShoppingCart className="h-4 w-4" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">0</Badge>
                    </Button>
                  </Link>
                )}

                {/* Wishlist (for customers) */}
                {userRole === "customer" && (
                  <Link href="/customer/wishlist">
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(session.user as any)?.image} alt="User" />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium">
                          {session.user?.name || "User"}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                      {userRole && (
                        <Badge variant="outline" className={`mt-1 ${getRoleColor(userRole)}`} size="sm">
                          {getRoleIcon(userRole)}
                          <span className="ml-1 capitalize">{userRole}</span>
                        </Badge>
                      )}
                    </div>
                    
                    {navConfig.dropdownItems.map((item, index) => {
                      const IconComponent = item.icon
                      return (
                        <DropdownMenuItem key={index} asChild>
                          <Link href={item.href} className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between py-4 border-b">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <div className="bg-orange-600 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold">ShopHub</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="py-4 space-y-2">
                  {navConfig.mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile User Section */}
                {session ? (
                  <div className="border-t pt-4 space-y-2">
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={(session.user as any)?.image} alt="User" />
                          <AvatarFallback>
                            {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{session.user?.name}</p>
                          <p className="text-xs text-gray-500">{session.user?.email}</p>
                          {userRole && (
                            <Badge variant="outline" className={`mt-1 ${getRoleColor(userRole)}`} size="sm">
                              {getRoleIcon(userRole)}
                              <span className="ml-1 capitalize">{userRole}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {navConfig.dropdownItems.map((item, index) => {
                        const IconComponent = item.icon
                        return (
                          <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <IconComponent className="h-4 w-4" />
                            {item.label}
                          </Link>
                        )
                      })}
                      
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleSignOut()
                          setIsMenuOpen(false)
                        }}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4 space-y-2">
                    <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        Sign Up
                      </Button>
                    </Link>
                    
                    {/* Additional Links */}
                    <div className="pt-2 space-y-1">
                      <Link
                        href="/contact"
                        className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Customer Care
                      </Link>
                      <Link
                        href="/faqs"
                        className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Help & FAQs
                      </Link>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
