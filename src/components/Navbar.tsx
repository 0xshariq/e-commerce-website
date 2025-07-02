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
  MapPin,
  User,
  Shield,
  Store,
  Users,
  X,
  ChevronDown,
} from "lucide-react"
import { getNavConfig } from "@/lib/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const navConfig = getNavConfig(session?.user?.role)

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
        return "border-purple-600 text-purple-400"
      case "vendor":
        return "border-green-600 text-green-400"
      case "customer":
        return "border-blue-600 text-blue-400"
      default:
        return "border-gray-600 text-gray-400"
    }
  }

  const authOptions = [
    {
      role: "customer",
      label: "Customer",
      icon: Users,
      color: "text-blue-400",
      signinHref: "/customer/signin",
      signupHref: "/customer/signup",
    },
    {
      role: "vendor",
      label: "Vendor/Seller",
      icon: Store,
      color: "text-green-400",
      signinHref: "/vendor/signin",
      signupHref: "/vendor/signup",
    },
    {
      role: "admin",
      label: "Administrator",
      icon: Shield,
      color: "text-purple-400",
      signinHref: "/admin/signin",
      signupHref: "/admin/signup",
    },
  ]

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      {/* Top Bar */}
      <div className="bg-gray-800 px-4 py-2 text-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Free shipping on orders over $50</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {!session && (
              <>
                <Link href="/vendor/signup" className="text-gray-300 hover:text-white transition-colors">
                  Become a Seller
                </Link>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Customer Care
                </Link>
              </>
            )}
            <Link href="/faqs" className="text-gray-300 hover:text-white transition-colors">
              FAQs
            </Link>
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
            <span className="text-xl font-bold text-white hidden sm:block">ShopHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1">
            {navConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-orange-400 transition-colors font-medium"
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
                className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-12"
              />
              <Button size="sm" className="absolute right-1 top-1 bg-orange-600 hover:bg-orange-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {!session && (
              <Button variant="ghost" className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Deliver to 110001</span>
              </Button>
            )}

            {session ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-gray-300 hover:text-white">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || undefined} />
                        <AvatarFallback className="bg-orange-600 text-white">
                          {session?.user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{session?.user?.name}</span>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(session?.user?.role)}
                          <span className="text-xs text-gray-400 capitalize">{session?.user?.role}</span>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                      <p className="text-xs text-gray-400">{session?.user?.email}</p>
                      <Badge variant="outline" className={`mt-1 ${getRoleColor(session?.user?.role)}`}>
                        {session?.user?.role.toUpperCase()}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    {navConfig.dropdownItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem
                          key={item.href}
                          asChild
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Link href={item.href} className="flex items-center">
                            <Icon className="mr-2 h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Wishlist & Cart for customers */}
                {session?.user?.role === "customer" && (
                  <>
                    <Button variant="ghost" className="relative text-gray-300 hover:text-white">
                      <Heart className="h-5 w-5" />
                      <Badge className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs">3</Badge>
                    </Button>
                    <Button variant="ghost" className="relative text-gray-300 hover:text-white">
                      <ShoppingCart className="h-5 w-5" />
                      <Badge className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs">2</Badge>
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                {/* Sign In Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-300 hover:text-white flex items-center gap-1">
                      Sign In
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-gray-400 font-medium">Sign in as:</p>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    {authOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <DropdownMenuItem
                          key={option.role}
                          asChild
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Link href={option.signinHref} className="flex items-center">
                            <Icon className={`mr-2 h-4 w-4 ${option.color}`} />
                            {option.label}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sign Up Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1">
                      Sign Up
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-gray-400 font-medium">Join as:</p>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    {authOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <DropdownMenuItem
                          key={option.role}
                          asChild
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Link href={option.signupHref} className="flex items-center">
                            <Icon className={`mr-2 h-4 w-4 ${option.color}`} />
                            {option.label}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="lg:hidden text-gray-300 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 border-gray-800 w-80">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-600 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">ShopHub</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="space-y-4">
                  {navConfig.mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block text-gray-300 hover:text-orange-400 transition-colors font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {!session && (
                    <div className="pt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Sign Up As:</p>
                        <div className="space-y-2">
                          {authOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <Link
                                key={`signup-${option.role}`}
                                href={option.signupHref}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                              >
                                <Icon className={`h-4 w-4 ${option.color}`} />
                                <span className="text-sm">{option.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Sign In As:</p>
                        <div className="space-y-2">
                          {authOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <Link
                                key={`signin-${option.role}`}
                                href={option.signinHref}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2 p-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                              >
                                <Icon className={`h-4 w-4 ${option.color}`} />
                                <span className="text-sm">{option.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
