"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, HelpCircle, Loader2, RefreshCw } from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

interface CategoryInfo {
  value: string
  label: string
  count: number
}

interface FAQResponse {
  success: boolean
  faqs: FAQ[]
  total: number
  categories: CategoryInfo[]
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchFAQs = async (query = "", category = "all") => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append("q", query)
      if (category !== "all") params.append("category", category)
      
      const response = await fetch(`/api/faqs?${params.toString()}`)
      const data: FAQResponse = await response.json()
      
      if (data.success) {
        setFaqs(data.faqs)
        setCategories(data.categories)
        setHasLoaded(true)
      } else {
        console.error('Failed to fetch FAQs:', data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchFAQs(searchQuery, selectedCategory)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    fetchFAQs(searchQuery, category)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    fetchFAQs("", "all")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about shopping, orders, payments, shipping, and more. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Load FAQs Button */}
        {!hasLoaded && (
          <div className="text-center mb-8">
            <Button 
              onClick={() => fetchFAQs()} 
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading FAQs...
                </>
              ) : (
                <>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Load FAQs
                </>
              )}
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        {hasLoaded && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter
              </CardTitle>
              <CardDescription>
                Search through {categories.find(c => c.value === "all")?.count || 0} frequently asked questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategorySelect(category.value)}
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    {category.label}
                    <Badge variant="secondary" className="ml-1">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQs List */}
        {hasLoaded && (
          <Card>
            <CardHeader>
              <CardTitle>
                {faqs.length > 0 ? (
                  <>Showing {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''}</>
                ) : (
                  'No FAQs Found'
                )}
              </CardTitle>
              {searchQuery && (
                <CardDescription>
                  Search results for "{searchQuery}"
                  {selectedCategory !== "all" && (
                    <> in {categories.find(c => c.value === selectedCategory)?.label}</>
                  )}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading FAQs...</span>
                </div>
              ) : faqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="text-left hover:text-blue-600 transition-colors">
                        <div className="flex items-start gap-3 pr-4">
                          <span className="flex-1">{faq.question}</span>
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.value === faq.category)?.label.split(' ')[0] || faq.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 leading-relaxed">
                        <div className="pt-2">
                          {faq.answer}
                          
                          {/* Tags */}
                          {faq.tags && faq.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-500 mr-2">Tags:</span>
                              {faq.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search query or selecting a different category.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        {hasLoaded && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Still Need Help?</CardTitle>
              <CardDescription>
                Can't find the answer you're looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Contact Information</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> khanshariq92213@gmail.com
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> +91 72081 79779
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Support Hours:</strong> Monday-Saturday, 9 AM to 6 PM IST
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/contact">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Contact Support
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/policy">
                        Privacy Policy
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>
    </div>
  )
}
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
