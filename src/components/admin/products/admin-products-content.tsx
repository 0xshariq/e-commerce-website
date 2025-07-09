"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye
} from "lucide-react"

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  vendor: {
    id: string;
    name: string;
  };
  stockQuantity: number;
  status: 'active' | 'pending' | 'flagged' | 'archived';
  isFeatured: boolean;
  createdAt: string;
  flaggedReason?: string;
  flaggedBy?: string;
  image?: string;
}

export default function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'flagged'>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/products");
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductAction = async (productId: string, action: "approve" | "remove") => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state
        setProducts(prevProducts => {
          return prevProducts.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                status: action === 'approve' ? 'active' : 'archived'
              };
            }
            return product;
          });
        });
      } else {
        throw new Error(`Failed to ${action} product`);
      }
    } catch (error) {
      console.error(`Failed to ${action} product:`, error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || product.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white mb-4">{error}</p>
          <Button onClick={fetchProducts} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Product Management</h1>
        <p className="text-gray-400 text-sm sm:text-base">Review and manage all products on the platform</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search products by name, vendor, or category" 
            className="pl-10 bg-gray-800/80 border-gray-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex gap-2">
            <Badge 
              className={`cursor-pointer ${filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setFilter('all')}
            >
              All
            </Badge>
            <Badge 
              className={`cursor-pointer ${filter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </Badge>
            <Badge 
              className={`cursor-pointer ${filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </Badge>
            <Badge 
              className={`cursor-pointer ${filter === 'flagged' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={() => setFilter('flagged')}
            >
              Flagged
            </Badge>
          </div>
        </div>
      </div>

      {/* Products List */}
      <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">Products</CardTitle>
              <CardDescription>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchProducts} 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No products match your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-colors"
                >
                  <div className="sm:w-20 sm:h-20 w-full h-32 bg-gray-600 rounded-md overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <h3 className="text-white font-medium">{product.name}</h3>
                      {product.status === 'active' && (
                        <Badge className="bg-green-600">Active</Badge>
                      )}
                      {product.status === 'pending' && (
                        <Badge className="bg-yellow-600">Pending</Badge>
                      )}
                      {product.status === 'flagged' && (
                        <Badge className="bg-red-600">Flagged</Badge>
                      )}
                      {product.status === 'archived' && (
                        <Badge className="bg-gray-600">Archived</Badge>
                      )}
                      {product.isFeatured && (
                        <Badge className="bg-purple-600">Featured</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-1">
                      <span className="font-medium text-gray-300">
                        ₹{product.discountPrice || product.price}
                      </span>
                      {product.discountPrice && (
                        <span className="ml-1 line-through text-gray-500">₹{product.price}</span>
                      )}
                      <span className="mx-2">•</span>
                      Stock: {product.stockQuantity}
                    </p>
                    
                    <div className="flex flex-wrap gap-y-1 text-xs text-gray-400">
                      <span className="after:content-['•'] after:mx-2">Vendor: {product.vendor.name}</span>
                      <span className="after:content-['•'] after:mx-2">Category: {product.category}</span>
                      <span>Added: {new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {product.status === 'flagged' && product.flaggedReason && (
                      <p className="text-xs text-red-400 mt-2">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />
                        Flagged: {product.flaggedReason}
                        {product.flaggedBy && ` by ${product.flaggedBy}`}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 mt-3 sm:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      onClick={() => window.location.href = `/admin/products/${product.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {(product.status === 'pending' || product.status === 'flagged') && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleProductAction(product.id, "approve")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    
                    {product.status !== 'archived' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        onClick={() => handleProductAction(product.id, "remove")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
