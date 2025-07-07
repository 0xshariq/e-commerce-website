import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Package } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ShopHub</span>
              </div>
              <p className="text-gray-400 mb-6">
                Your one-stop destination for all your shopping needs. Quality products, competitive prices, and
                exceptional service.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  <Youtube className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-orange-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Customer Service</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/track" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Warranty
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-orange-400" />
                  <span className="text-gray-400">123 Commerce Street, Business District, NY 10001</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-orange-400" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-orange-400" />
                  <span className="text-gray-400">support@shophub.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-800" />

      {/* Bottom Footer */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">© 2024 ShopHub. All rights reserved.</div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-orange-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
