"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, User, Heart, Menu, Package, LogOut, Settings, MapPin } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      {/* Top Bar */}
      <div className="bg-gray-800 px-4 py-2 text-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Free shipping on orders over $50</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/seller" className="text-gray-300 hover:text-white">
              Become a Seller
            </Link>
            <Link href="/help" className="text-gray-300 hover:text-white">
              Customer Care
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ShopHub</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
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
            {/* Location */}
            <Button variant="ghost" className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Deliver to 110001</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-gray-300 hover:text-white">
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button variant="ghost" className="relative text-gray-300 hover:text-white">
              <Heart className="h-5 w-5" />
              <Badge className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs">3</Badge>
            </Button>

            {/* Cart */}
            <Button variant="ghost" className="relative text-gray-300 hover:text-white">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs">2</Badge>
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="hidden md:flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
          <Link href="/electronics" className="text-gray-300 hover:text-orange-400 transition-colors">
            Electronics
          </Link>
          <Link href="/fashion" className="text-gray-300 hover:text-orange-400 transition-colors">
            Fashion
          </Link>
          <Link href="/home" className="text-gray-300 hover:text-orange-400 transition-colors">
            Home & Kitchen
          </Link>
          <Link href="/books" className="text-gray-300 hover:text-orange-400 transition-colors">
            Books
          </Link>
          <Link href="/sports" className="text-gray-300 hover:text-orange-400 transition-colors">
            Sports
          </Link>
          <Link href="/beauty" className="text-gray-300 hover:text-orange-400 transition-colors">
            Beauty
          </Link>
          <Link href="/automotive" className="text-gray-300 hover:text-orange-400 transition-colors">
            Automotive
          </Link>
        </div>
      </div>
    </header>
  )
}
