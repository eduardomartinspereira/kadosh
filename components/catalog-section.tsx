"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Filter, Share2, Eye, Image as ImageIcon, Download, AlertCircle } from "lucide-react"
import Image from "next/image"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { useSession } from "next-auth/react"
import { showToast } from "@/lib/toast-config"
import { useSearch } from "@/context/SearchContext"

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
  sizeBytes?: bigint | null
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
  mainImage?: string
  images?: Array<{
    url: string
    label?: string
    width?: number
    height?: number
  }>
  arquivoPdf?: string
  arquivoPng?: string
  createdAt: string
  categories: Array<{
    category: Category
  }>
  assets: ProductAsset[]
}

export default function CatalogSection() {
  const { data: session, status } = useSession()
  const { searchTerm, updateSearchFromURL, clearSearch } = useSearch()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadStatus, setDownloadStatus] = useState<any>(null)

  // Processar parâmetros de URL para pesquisa
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
      const searchParam = urlParams.get('search')
      if (searchParam) {
        updateSearchFromURL(searchParam)
      }
    }
  }, [updateSearchFromURL])

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
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  // Buscar status dos downloads do usuário
  useEffect(() => {
    if ((session?.user as any)?.id) {
      const fetchDownloadStatus = async () => {
        try {
          const response = await fetch('/api/downloads/status')
          if (response.ok) {
            const data = await response.json()
            setDownloadStatus(data.data)
          }
        } catch (error) {
          console.error('Erro ao buscar status dos downloads:', error)
        }
      }

      fetchDownloadStatus()
    }
  }, [session])

  // Filtrar produtos baseado na pesquisa e categoria
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    // Filtrar por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.categories.some(cat => cat.category.slug === selectedCategory)
      )
    }

    // Filtrar por termo de pesquisa
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      
      // Filtro por nome/descrição/categoria
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.categories.some(cat => 
          cat.category.name.toLowerCase().includes(searchLower)
        )
      )
    }

    return filtered
  }, [allProducts, selectedCategory, searchTerm])

  // Função para obter imagem do produto
  const getProductImage = (product: Product) => {
    if (product.mainImage) {
      return product.mainImage
    }
    
    if (product.images && product.images.length > 0) {
      return product.images[0].url
    }
    
    // Fallback para imagem padrão
    return "/placeholder.svg"
  }

  // Função para obter nomes das categorias
  const getCategoryNames = (product: Product) => {
    return product.categories.map(cat => cat.category.name).join(', ')
  }

  // Funções de download
  const handleDownloadPDF = async (product: Product) => {
    if (!(session?.user as any)?.id) {
      showToast.userNotLoggedIn()
      return
    }

    if (!product.arquivoPdf) {
      showToast.downloadError('Arquivo PDF não disponível para este produto')
      return
    }

    try {
      const response = await fetch(`/api/download/pdf/${product.id}`)
      const data = await response.json()

      if (response.ok) {
        // Atualizar status dos downloads
        const statusResponse = await fetch('/api/downloads/status')
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setDownloadStatus(statusData.data)
        }

        // Iniciar download
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = data.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToast.downloadStarted(product.name, 'PDF')
      } else {
        console.error('🔍 Debug Frontend - Erro na API PDF:', data)
        showToast.downloadError(data.error || 'Erro desconhecido na API PDF')
      }
    } catch (error) {
      console.error('🔍 Debug Frontend - Erro no download PDF:', error)
      showToast.genericError('Erro ao iniciar download PDF')
    }
  }

  const handleDownloadPNG = async (product: Product) => {
    if (!(session?.user as any)?.id) {
      showToast.userNotLoggedIn()
      return
    }

    if (!product.arquivoPng) {
      showToast.downloadError('Arquivo PNG não disponível para este produto')
      return
    }

    try {
      const response = await fetch(`/api/download/png/${product.id}`)
      const data = await response.json()

      if (response.ok) {
        // Atualizar status dos downloads
        const statusResponse = await fetch('/api/downloads/status')
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setDownloadStatus(statusData.data)
        }

        // Iniciar download
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = data.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        showToast.downloadStarted(product.name, 'PNG')
      } else {
        showToast.downloadError(data.error)
      }
    } catch (error) {
      console.error('Erro no download:', error)
      showToast.genericError('Erro ao iniciar download')
    }
  }

  // Componente para imagem do produto com fallback
  const ProductImage = ({ product, className }: { product: Product; className?: string }) => (
    <Image
      src={getProductImage(product)}
      alt={product.name}
      width={400}
      height={300}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.src = "/placeholder.svg"
      }}
    />
  )

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground">Carregando produtos...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="catalog" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 rounded-lg mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Catálogo de Produtos
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Explore nossa coleção de artes e materiais marcantes para nossos clientes.
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="w-full md:w-80">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          
          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Pesquisa: "{searchTerm}"
                  <button
                    onClick={() => clearSearch()}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Categoria: {categories.find(c => c.slug === selectedCategory)?.name}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearSearch()
                  setSelectedCategory("all")
                }}
                className="text-xs"
              >
                Limpar filtros
              </Button>
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            {filteredProducts.length} produtos encontrados
          </div>
        </div>

        {/* Download Status */}
        {downloadStatus && (
          <div className="bg-card rounded-lg border p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Status dos Downloads</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {downloadStatus.limits?.daily?.current || 0}/{downloadStatus.limits?.daily?.max || 0}
                </div>
                <div className="text-sm text-muted-foreground">Downloads Hoje</div>
                <div className="text-xs text-muted-foreground">
                  Restam: {downloadStatus.limits?.daily?.remaining || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {downloadStatus.limits?.monthly?.current || 0}/{downloadStatus.limits?.monthly?.max || 0}
                </div>
                <div className="text-sm text-muted-foreground">Downloads Este Mês</div>
                <div className="text-xs text-muted-foreground">
                  Restam: {downloadStatus.limits?.monthly?.remaining || 0}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, ((downloadStatus.limits?.monthly?.current || 0) / (downloadStatus.limits?.monthly?.max || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-foreground">
                  {downloadStatus.subscription?.plan?.name || 'Sem plano'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {downloadStatus.subscription?.status === 'ACTIVE' ? 'Assinante ativo' : 'Não assinante'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <div className="relative rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border border-border">
                {/* Imagem do Produto - Mantendo proporções originais */}
                <div className="w-full flex justify-center">
                  <ProductImage product={product} className="w-full h-auto max-h-64 object-contain" />
                </div>
                
                {/* Badge da Categoria */}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                    {product.categories[0]?.category.name || 'Sem categoria'}
                  </Badge>
                </div>
                
                {/* Overlay com informações ao hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Clique para ver detalhes</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Message */}
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `Nenhum produto encontrado para "${searchTerm}"` : 'Nenhum produto disponível no momento.'}
            </p>
          </div>
        )}

        {/* Product Detail Modal */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    {selectedProduct.name}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {selectedProduct.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Imagem Principal */}
                    <div>
                      <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                        <ProductImage
                          product={selectedProduct}
                          className="w-full rounded-lg"
                        />
                      </div>
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
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
                          ))}
                        </div>
                      </div>

                      {/* Botões de Download */}
                      <div className="pt-4">
                        <h4 className="font-semibold mb-3 text-foreground">Downloads Disponíveis</h4>
                        
                        {/* Verificar arquivo PDF disponível */}
                        {selectedProduct.arquivoPdf && (
                          <div className="mb-3">
                            <Button 
                              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                              onClick={() => handleDownloadPDF(selectedProduct)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </Button>
                            <div className="text-xs text-muted-foreground mt-1 space-y-1">
                              <p>Arquivo PDF disponível</p>
                              <p>Formato: PDF</p>
                            </div>
                          </div>
                        )}

                        {/* Verificar arquivo PNG disponível */}
                        {selectedProduct.arquivoPng && (
                          <div className="mb-3">
                            <Button 
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                              onClick={() => handleDownloadPNG(selectedProduct)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PNG
                            </Button>
                            <div className="text-xs text-muted-foreground mt-1 space-y-1">
                              <p>Arquivo PNG disponível</p>
                              <p>Formato: PNG</p>
                            </div>
                          </div>
                        )}

                        {/* Mensagem quando não há downloads disponíveis */}
                        {(!selectedProduct.arquivoPdf && !selectedProduct.arquivoPng) && (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground text-sm">
                              Nenhum arquivo de download disponível para este produto.
                            </p>
                          </div>
                        )}
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
    </section>
  )
} 