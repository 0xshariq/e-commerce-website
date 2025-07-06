"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, ChevronDown, ChevronUp, HelpCircle, Sparkles, Clock } from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  priority: number
}

interface AIInsights {
  explanation?: string
  suggestedNewFAQ?: string
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "account", label: "Account" },
  { value: "orders", label: "Orders" },
  { value: "payment", label: "Payment" },
  { value: "shipping", label: "Shipping" },
  { value: "returns", label: "Returns" },
  { value: "vendor", label: "Vendor" },
  { value: "support", label: "Support" },
]

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [openItems, setOpenItems] = useState<string[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [useAI, setUseAI] = useState(false)
  const [aiCooldown, setAiCooldown] = useState(false)

  const fetchFAQs = async (query = "", category = "all", withAI = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append("q", query)
      if (category !== "all") params.append("category", category)
      if (withAI) params.append("ai", "true")

      const response = await fetch(`/api/faqs?${params}`)
      const data = await response.json()

      setFaqs(data.faqs || [])
      setAiInsights(data.aiInsights || null)
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFAQs()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFAQs(searchQuery, selectedCategory, useAI)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory, useAI])

  // AI cooldown timer (15 minutes)
  useEffect(() => {
    if (useAI) {
      setAiCooldown(true)
      const timer = setTimeout(
        () => {
          setAiCooldown(false)
          setUseAI(false)
        },
        15 * 60 * 1000,
      ) // 15 minutes

      return () => clearTimeout(timer)
    }
  }, [useAI])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleAISearch = () => {
    if (!aiCooldown && searchQuery.trim()) {
      setUseAI(true)
      fetchFAQs(searchQuery, selectedCategory, true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <HelpCircle className="h-8 w-8 text-orange-400" />
            <h1 className="text-4xl md:text-6xl font-bold text-white">Frequently Asked Questions</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Find answers to common questions about ShopHub. Can't find what you're looking for? Try our AI-powered
            search!
          </p>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-lg"
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={
                    selectedCategory === category.value
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  }
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* AI Search Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleAISearch}
                disabled={aiCooldown || !searchQuery.trim() || loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {aiCooldown ? (
                  <>
                    <Clock className="h-4 w-4 mr-1" />
                    AI Search (Cooldown)
                  </>
                ) : (
                  "AI-Powered Search"
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* AI Insights */}
          {aiInsights && (
            <Card className="bg-purple-900/20 border-purple-600/30 mb-8">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.explanation && <p className="text-purple-100">{aiInsights.explanation}</p>}
                {aiInsights.suggestedNewFAQ && (
                  <div className="bg-purple-800/30 p-4 rounded-lg">
                    <p className="text-purple-200 font-medium">Suggested FAQ:</p>
                    <p className="text-purple-100">{aiInsights.suggestedNewFAQ}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading FAQs...</p>
            </div>
          )}

          {/* FAQ Results */}
          {!loading && (
            <>
              <div className="mb-6">
                <p className="text-gray-400">
                  {faqs.length} {faqs.length === 1 ? "result" : "results"} found
                  {searchQuery && ` for "${searchQuery}"`}
                  {selectedCategory !== "all" && ` in ${categories.find((c) => c.value === selectedCategory)?.label}`}
                </p>
              </div>

              {faqs.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700 text-center py-12">
                  <CardContent>
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No FAQs Found</h3>
                    <p className="text-gray-400 mb-4">
                      We couldn't find any FAQs matching your search. Try different keywords or browse all categories.
                    </p>
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory("all")
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      View All FAQs
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <Card key={faq.id} className="bg-gray-800 border-gray-700">
                      <Collapsible open={openItems.includes(faq.id)} onOpenChange={() => toggleItem(faq.id)}>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex-1">
                                  <CardTitle className="text-white text-left">{faq.question}</CardTitle>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="border-orange-600 text-orange-400">
                                      {categories.find((c) => c.value === faq.category)?.label || faq.category}
                                    </Badge>
                                    {faq.priority === 1 && <Badge className="bg-green-600 text-white">Popular</Badge>}
                                  </div>
                                </div>
                              </div>
                              {openItems.includes(faq.id) ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Contact Support */}
          <Card className="bg-gray-800 border-gray-700 mt-12">
            <CardHeader>
              <CardTitle className="text-white">Still Need Help?</CardTitle>
              <CardDescription className="text-gray-400">
                Can't find the answer you're looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  asChild
                >
                  <a href="mailto:support@shophub.com">Email Us</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
