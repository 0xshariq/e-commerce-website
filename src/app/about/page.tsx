import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Shield, 
  Heart, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Globe, 
  Users, 
  Clock, 
  Star,
  Zap,
  Target,
  Handshake,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <Package className="h-10 w-10 text-white" />
            </div>
            <span className="text-4xl font-bold text-white">ShopHub</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Revolutionizing<br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              E-commerce
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-4xl mx-auto mb-8 leading-relaxed">
            Connecting millions of customers with thousands of verified vendors worldwide. 
            We&apos;re building the future of online shopping with cutting-edge technology, 
            unmatched security, and exceptional user experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3">
              Become a Vendor
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">2.5M+</div>
              <div className="text-gray-300 text-lg">Happy Customers</div>
              <div className="text-orange-400 text-sm">+15% this month</div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Handshake className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">75K+</div>
              <div className="text-gray-300 text-lg">Verified Vendors</div>
              <div className="text-green-400 text-sm">+8% this month</div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">1.8M+</div>
              <div className="text-gray-300 text-lg">Products Listed</div>
              <div className="text-blue-400 text-sm">+12% this month</div>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-300 text-lg">Uptime SLA</div>
              <div className="text-purple-400 text-sm">24/7 availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Journey</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From a small startup with big dreams to India&apos;s leading e-commerce platform
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-4">Founded on Innovation</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      ShopHub was born in 2020 from a revolutionary idea: to democratize e-commerce and make 
                      online shopping accessible, secure, and delightful for everyone. What started as a small 
                      team of passionate developers has evolved into a global platform serving millions.
                    </p>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Our mission extends beyond mere transactions. We empower businesses of all sizes to reach 
                      customers worldwide while providing shoppers with an unparalleled selection of authentic 
                      products, competitive prices, and exceptional service.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-orange-400 mb-1">₹500Cr+</div>
                      <div className="text-gray-300 text-sm">Annual GMV</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="text-2xl font-bold text-green-400 mb-1">4.8★</div>
                      <div className="text-gray-300 text-sm">Customer Rating</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2">Innovation</Badge>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2">Trust</Badge>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">Quality</Badge>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">Excellence</Badge>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 p-8 rounded-2xl border border-gray-600">
                <h4 className="text-xl font-bold text-white mb-6">Why Choose ShopHub?</h4>
                <div className="space-y-4">
                  {[
                    { icon: Shield, text: "Bank-grade Security & Encryption", color: "text-blue-400" },
                    { icon: Zap, text: "Lightning Fast Delivery Network", color: "text-yellow-400" },
                    { icon: Star, text: "Quality Assurance & Authenticity", color: "text-green-400" },
                    { icon: Globe, text: "24/7 Multilingual Support", color: "text-purple-400" },
                    { icon: Target, text: "AI-Powered Personalization", color: "text-orange-400" },
                    { icon: CheckCircle, text: "100% Buyer Protection", color: "text-emerald-400" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 group hover:bg-gray-700/50 p-3 rounded-lg transition-colors">
                      <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-gray-300 group-hover:text-white transition-colors">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide every decision we make and every feature we build
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/20 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Customer Obsession</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center leading-relaxed">
                  Every decision, every feature, every interaction is designed with our customers at the center. 
                  Your success drives our innovation and your satisfaction fuels our passion.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/20 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Trust & Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center leading-relaxed">
                  We implement military-grade security, maintain transparent policies, and build lasting 
                  relationships based on honesty, reliability, and mutual respect.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader className="text-center pb-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Relentless Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center leading-relaxed">
                  We&apos;re constantly pushing boundaries, embracing new technologies, and reimagining 
                  what&apos;s possible in e-commerce to stay ahead of tomorrow&apos;s needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Leadership Team</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet the visionaries driving ShopHub&apos;s mission to transform global commerce
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                name: "Priya Sharma", 
                role: "CEO & Founder", 
                bio: "Former Amazon VP with 15+ years in e-commerce",
                expertise: "Strategy, Operations"
              },
              { 
                name: "Arjun Patel", 
                role: "CTO & Co-Founder", 
                bio: "Ex-Google engineer, AI/ML specialist",
                expertise: "Technology, Innovation"
              },
              { 
                name: "Kavya Reddy", 
                role: "VP of Customer Experience", 
                bio: "Customer success expert from Flipkart",
                expertise: "UX, Support"
              },
            ].map((member, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-600 hover:bg-gray-700/50 transition-colors backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <CardTitle className="text-white text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-orange-400 font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-300 text-sm mb-2">{member.bio}</p>
                  <Badge variant="outline" className="border-gray-500 text-gray-300">
                    {member.expertise}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition & Awards */}
      <section className="py-20 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Recognition & Awards</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Industry recognition for our commitment to excellence and innovation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { 
                title: "Best E-commerce Platform", 
                year: "2024", 
                org: "Digital India Awards",
                color: "from-yellow-500 to-orange-500"
              },
              { 
                title: "Customer Choice Award", 
                year: "2024", 
                org: "Business Today",
                color: "from-blue-500 to-cyan-500"
              },
              { 
                title: "Innovation in Retail", 
                year: "2023", 
                org: "Retail Excellence India",
                color: "from-green-500 to-emerald-500"
              },
              { 
                title: "Fastest Growing Startup", 
                year: "2023", 
                org: "Economic Times",
                color: "from-purple-500 to-pink-500"
              },
            ].map((award, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-600 text-center hover:scale-105 transition-transform backdrop-blur-sm">
                <CardHeader>
                  <div className={`bg-gradient-to-r ${award.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg leading-tight">{award.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    <div className="font-medium">{award.org}</div>
                    <div className="text-orange-400">{award.year}</div>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Get In Touch</h2>
            <p className="text-xl text-gray-300 mb-12">
              Have questions? We&apos;d love to hear from you. Reach out to our team.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600">
                <Phone className="h-8 w-8 text-orange-400 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Phone Support</h3>
                <p className="text-gray-300">+91 1800-123-4567</p>
                <p className="text-gray-400 text-sm">24/7 Available</p>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600">
                <Mail className="h-8 w-8 text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Email Us</h3>
                <p className="text-gray-300">support@shophub.com</p>
                <p className="text-gray-400 text-sm">Response within 2 hours</p>
              </div>
              
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600">
                <MapPin className="h-8 w-8 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Visit Us</h3>
                <p className="text-gray-300">Bangalore, Karnataka</p>
                <p className="text-gray-400 text-sm">India</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3">
                Contact Sales
              </Button>
              <Button size="lg" variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-700 px-8 py-3">
                Partner with Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
