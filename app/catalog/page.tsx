"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Share2, Eye, Star, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { WhatsAppButton } from "@/components/whatsapp-button"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

interface ProductAsset {
  id: string
  label?: string
  uri: string
  type: string
  width?: number
  height?: number
  previewUri?: string
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  status: string
  isPublic: boolean
  createdAt: string
  categories: Array<{
    category: Category
  }>
  assets: ProductAsset[]
}

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  })

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }

    fetchCategories()
  }, [])

  // Buscar todos os produtos uma vez
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/products?limit=1000') // Buscar todos os produtos
        if (response.ok) {
          const data = await response.json()
          setAllProducts(data.products)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  // Filtrar produtos em tempo real
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.categories.some(cat => cat.category.slug === selectedCategory)
      )
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.categories.some(cat => 
          cat.category.name.toLowerCase().includes(searchLower)
        )
      )
    }

    return filtered
  }, [allProducts, searchTerm, selectedCategory])

  // Calcular paginação para produtos filtrados
  const paginatedProducts = useMemo(() => {
    const itemsPerPage = 12
    const startIndex = (pagination.page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, pagination.page])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset para primeira página
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset para primeira página
  }

  const getProductImage = (product: Product) => {
    if (product.assets && product.assets.length > 0) {
      return product.assets[0].uri
    }
    return '/placeholder.svg?height=400&width=600'
  }

  const getProductCategories = (product: Product) => {
    return product.categories.map(cat => cat.category.name).join(', ')
  }

  // Calcular total de páginas para produtos filtrados
  const totalPages = Math.ceil(filteredProducts.length / 12)

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Catálogo de Produtos
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore nossa coleção de artes e materiais marcantes para nossos clientes.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-muted-foreground">
            {loading ? 'Carregando...' : `${filteredProducts.length} produtos encontrados`}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground mb-8">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros ou termo de busca' 
                : 'Não há produtos disponíveis no momento'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                variant="outline"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Multiple Images Indicator */}
                  {product.assets && product.assets.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {product.assets.length}
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.categories.map((cat) => (
                      <Badge key={cat.category.id} variant="secondary" className="text-xs">
                        {cat.category.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Product Meta */}
                  <div className="flex items-center justify-end text-sm text-muted-foreground">
                    <span>{new Date(product.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </Button>
              )}
              
              <span className="px-4 py-2 text-sm">
                Página {pagination.page} de {totalPages}
              </span>
              
              {pagination.page < totalPages && (
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Próxima
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription className="text-base">
                  {new Date(selectedProduct.createdAt).getFullYear()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Imagem Principal */}
                  <div>
                    <Image
                      src={getProductImage(selectedProduct)}
                      alt={selectedProduct.name}
                      width={600}
                      height={400}
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* Detalhes do Produto */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">Descrição do Produto</h4>
                      <p className="text-muted-foreground">{selectedProduct.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-foreground">Categorias</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.categories.map((cat) => (
                          <Badge key={cat.category.id} variant="secondary">
                            {cat.category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <h4 className="font-semibold mr-2 text-foreground">Avaliação:</h4>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>


                  </div>
                </div>

                {/* Galeria de Imagens */}
                {selectedProduct.assets && selectedProduct.assets.length > 1 && (
                  <div>
                    <h4 className="font-semibold mb-4 text-foreground">Galeria do Produto</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {selectedProduct.assets.map((asset, index) => (
                        <div key={asset.id} className="relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={asset.uri}
                            alt={asset.label || `${selectedProduct.name} - Imagem ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {asset.label && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                              {asset.label}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <WhatsAppButton />
    </div>
  )
}
