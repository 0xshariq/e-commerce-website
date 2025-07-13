"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Search, HelpCircle, Loader2, ThumbsUp, ThumbsDown, Eye, Filter, ArrowUpDown, MessageSquare, Send } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface FAQ {
  _id: string
  question: string
  answer: string
  category: string
  tags: string[]
  views: number
  helpful: number
  notHelpful: number
  priority: number
  createdAt: string
  updatedAt: string
}

interface CategoryInfo {
  value: string
  label: string
  count: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface FAQResponse {
  success: boolean
  data: {
    faqs: FAQ[]
    pagination: PaginationInfo
    categories: CategoryInfo[]
    query: {
      search: string
      category: string
      sortBy: string
      sortOrder: string
    }
  }
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("priority")
  const [sortOrder, setSortOrder] = useState("desc")
  const [openItems, setOpenItems] = useState<string[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState<string[]>([])
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [contactLoading, setContactLoading] = useState(false)

  const fetchFAQs = async (query = "", category = "all", sort = "priority", order = "desc", page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append("q", query)
      if (category !== "all") params.append("category", category)
      params.append("sortBy", sort)
      params.append("sortOrder", order)
      params.append("page", page.toString())
      params.append("limit", "20")

      const response = await axios.get(`/api/faqs?${params}`)
      const data: FAQResponse = response.data

      if (data.success) {
        setFaqs(data.data.faqs)
        setCategories(data.data.categories)
        setPagination(data.data.pagination)
      } else {
        toast.error("Failed to load FAQs")
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
      toast.error("Error loading FAQs")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFAQs(searchQuery, selectedCategory, sortBy, sortOrder)
  }

  const handleFeedback = async (faqId: string, type: 'helpful' | 'notHelpful') => {
    if (feedbackLoading.includes(faqId)) return

    setFeedbackLoading(prev => [...prev, faqId])
    try {
      await axios.post(`/api/faqs/${faqId}/feedback`, { type })
      
      // Update local state
      setFaqs(prev => prev.map(faq => 
        faq._id === faqId 
          ? { 
              ...faq, 
              helpful: type === 'helpful' ? faq.helpful + 1 : faq.helpful,
              notHelpful: type === 'notHelpful' ? faq.notHelpful + 1 : faq.notHelpful
            }
          : faq
      ))
      
      toast.success("Thank you for your feedback!")
    } catch (error) {
      toast.error("Failed to submit feedback")
    } finally {
      setFeedbackLoading(prev => prev.filter(id => id !== faqId))
    }
  }

  const handleViewIncrement = async (faqId: string) => {
    try {
      await axios.post(`/api/faqs/${faqId}/view`)
      
      // Update local state
      setFaqs(prev => prev.map(faq => 
        faq._id === faqId 
          ? { ...faq, views: faq.views + 1 }
          : faq
      ))
    } catch (error) {
      // Silently fail for view increment
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all required fields")
      return
    }

    setContactLoading(true)
    try {
      await axios.post('/api/contact', {
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject || "FAQ Page Inquiry",
        message: contactForm.message,
        source: "faq_page"
      })
      
      toast.success("Message sent successfully! We'll get back to you soon.")
      setContactForm({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setContactLoading(false)
    }
  }

  const handleContactInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }))
  }

  // Load initial FAQs
  useEffect(() => {
    fetchFAQs()
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "") {
        fetchFAQs(searchQuery, selectedCategory, sortBy, sortOrder)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions or contact us for personalized assistance.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search FAQs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    placeholder="Search questions, answers, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </form>

                <div className="flex flex-wrap gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label} ({cat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    {sortOrder === 'desc' ? 'Desc' : 'Asc'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Results */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : faqs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
                  <p className="text-gray-600">
                    {searchQuery || selectedCategory !== 'all'
                      ? "Try adjusting your search or filters"
                      : "No FAQs available at the moment"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {pagination ? `${pagination.totalItems} FAQ${pagination.totalItems !== 1 ? 's' : ''} Found` : 'FAQs'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
                    {faqs.map((faq) => (
                      <AccordionItem key={faq._id} value={faq._id}>
                        <AccordionTrigger 
                          className="text-left hover:text-blue-600 transition-colors"
                          onClick={() => handleViewIncrement(faq._id)}
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{faq.question}</span>
                              <Badge variant="secondary" className="text-xs">
                                {faq.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {faq.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {faq.helpful}
                              </span>
                              {faq.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {faq.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div 
                              className="prose prose-sm max-w-none text-gray-700"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                            
                            <Separator />
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                Was this helpful?
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFeedback(faq._id, 'helpful')}
                                  disabled={feedbackLoading.includes(faq._id)}
                                  className="flex items-center gap-1"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                  Yes ({faq.helpful})
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFeedback(faq._id, 'notHelpful')}
                                  disabled={feedbackLoading.includes(faq._id)}
                                  className="flex items-center gap-1"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                  No ({faq.notHelpful})
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrevPage || loading}
                  onClick={() => fetchFAQs(searchQuery, selectedCategory, sortBy, sortOrder, pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() => fetchFAQs(searchQuery, selectedCategory, sortBy, sortOrder, pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Still Need Help?
                </CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message and we'll get back to you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <Input
                    placeholder="Your Name *"
                    value={contactForm.name}
                    onChange={(e) => handleContactInputChange('name', e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email *"
                    value={contactForm.email}
                    onChange={(e) => handleContactInputChange('email', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Subject (Optional)"
                    value={contactForm.subject}
                    onChange={(e) => handleContactInputChange('subject', e.target.value)}
                  />
                  <Textarea
                    placeholder="Your Message *"
                    value={contactForm.message}
                    onChange={(e) => handleContactInputChange('message', e.target.value)}
                    rows={4}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={contactLoading}>
                    {contactLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Categories Overview */}
            {categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                      className="w-full justify-between"
                      onClick={() => {
                        setSelectedCategory('all')
                        fetchFAQs(searchQuery, 'all', sortBy, sortOrder)
                      }}
                    >
                      All Categories
                      <Badge variant="secondary">
                        {categories.reduce((sum, cat) => sum + cat.count, 0)}
                      </Badge>
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? 'default' : 'ghost'}
                        className="w-full justify-between"
                        onClick={() => {
                          setSelectedCategory(category.value)
                          fetchFAQs(searchQuery, category.value, sortBy, sortOrder)
                        }}
                      >
                        {category.label}
                        <Badge variant="secondary">{category.count}</Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/terms">Terms of Service</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/policy">Privacy Policy</a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="/refund">Refund Policy</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
