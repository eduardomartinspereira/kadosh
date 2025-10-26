"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Share2,
  Eye,
  Star,
  Image as ImageIcon,
  Download,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { showToast } from "../../lib/toast-config";
import LeftSidebar from "@/components/left-sidebar";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface ProductAsset {
  id: string;
  label?: string;
  uri: string;
  type: string;
  sizeBytes?: bigint | null;
  width?: number;
  height?: number;
  previewUri?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  isPublic: boolean;
  mainImage?: string;
  images?: Array<{
    url: string;
    label?: string;
    width?: number;
    height?: number;
  }>;
  arquivoPdf?: string;
  arquivoPng?: string;
  linkCanvas?: string;
  createdAt: string;
  categories: Array<{
    category: Category;
  }>;
  assets: ProductAsset[];
}

export default function CatalogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });

  // Estados para filtros
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true); // Aberta por padrão no desktop
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategories();
  }, []);

  // Buscar todos os produtos uma vez
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products?limit=1000"); // Buscar todos os produtos
        if (response.ok) {
          const data = await response.json();
          setAllProducts(data.products);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Buscar status dos downloads do usuário
  useEffect(() => {
    if ((session?.user as any)?.id) {
      const fetchDownloadStatus = async () => {
        try {
          const response = await fetch("/api/downloads/status");
          if (response.ok) {
            const data = await response.json();
            setDownloadStatus(data.data);
          }
        } catch (error) {
          console.error("Erro ao buscar status dos downloads:", error);
        }
      };

      fetchDownloadStatus();
    }
  }, [session]);

  // Filtrar produtos em tempo real
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filtro por categoria (dropdown)
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) =>
        product.categories.some((cat) => cat.category.slug === selectedCategory)
      );
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.categories.some((cat) =>
            cat.category.name.toLowerCase().includes(searchLower)
          )
      );
    }

    // Filtro por tipo de arquivo
    if (selectedFileTypes.length > 0) {
      filtered = filtered.filter((product) => {
        return selectedFileTypes.some((fileType) => {
          switch (fileType) {
            case "psd":
              return product.arquivoPdf; // PSD usa arquivoPdf
            case "png":
              return product.arquivoPng;
            case "canva":
              return product.linkCanvas;
            default:
              return false;
          }
        });
      });
    }

    // Filtro por categorias (sidebar)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        product.categories.some((cat) =>
          selectedCategories.includes(cat.category.id)
        )
      );
    }

    return filtered;
  }, [
    allProducts,
    searchTerm,
    selectedCategory,
    selectedFileTypes,
    selectedCategories,
  ]);

  // Calcular paginação para produtos filtrados
  const paginatedProducts = useMemo(() => {
    const itemsPerPage = 12;
    const startIndex = (pagination.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, pagination.page]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset para primeira página
    // Abrir sidebar de filtros quando pesquisar
    setIsLeftSidebarOpen(true);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset para primeira página
  };

  // Funções para controlar filtros
  const toggleFileType = (fileType: string) => {
    setSelectedFileTypes((prev) =>
      prev.includes(fileType)
        ? prev.filter((type) => type !== fileType)
        : [...prev, fileType]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedFileTypes([]);
    setSelectedCategories([]);
  };

  const toggleLeftSidebar = () => {
    setIsLeftSidebarOpen(!isLeftSidebarOpen);
  };

  const getProductImage = (product: Product) => {
    try {
      // Priorizar imagem principal
      if (product.mainImage && product.mainImage.trim() !== "") {
        return product.mainImage;
      }

      // Usar primeira imagem do array de imagens
      if (
        product.images &&
        Array.isArray(product.images) &&
        product.images.length > 0
      ) {
        const firstImage = product.images[0];
        if (firstImage?.url && firstImage.url.trim() !== "") {
          return firstImage.url;
        }
      }

      // Fallback para imagem local
      return "/placeholder.jpg";
    } catch (error) {
      console.warn("Erro ao obter imagem do produto:", product.name, error);
      return "/placeholder.jpg";
    }
  };

  // Componente de imagem com fallback
  const ProductImage = ({
    product,
    className = "",
  }: {
    product: Product;
    className?: string;
  }) => {
    const [imgSrc, setImgSrc] = useState(getProductImage(product));
    const [hasError, setHasError] = useState(false);

    const handleImageError = () => {
      if (!hasError) {
        setHasError(true);
        setImgSrc("/placeholder.jpg");
      }
    };

    return (
      <Image
        src={imgSrc}
        alt={product.name}
        fill
        className={className}
        onError={handleImageError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={85}
      />
    );
  };

  const getProductCategories = (product: Product) => {
    return product.categories.map((cat) => cat.category.name).join(", ");
  };

  // Funções de download atualizadas
  const handleDownloadPDF = async (product: Product) => {
    console.log("🔍 Debug session:", session);
    console.log("🔍 Debug session.user:", session?.user);
    console.log("🔍 Debug session.user.id:", (session?.user as any)?.id);

    if (!(session?.user as any)?.id) {
      showToast.userNotLoggedIn();
      return;
    }

    // Verificar se tem assinatura ativa
    if (
      !downloadStatus?.subscription?.status ||
      (downloadStatus.subscription.status !== "ACTIVE" &&
        downloadStatus.subscription.status !== "TRIALING")
    ) {
      showToast.error(
        "Você precisa de uma assinatura ativa para fazer downloads"
      );
      router.push("/plans");
      return;
    }

    // Verificar se há arquivo PDF disponível
    if (!product.arquivoPdf) {
      showToast.downloadError("Arquivo PDF não disponível para este produto");
      return;
    }

    try {
      const response = await fetch(`/api/download/pdf/${product.id}`);
      const data = await response.json();

      if (response.ok) {
        // Atualizar status dos downloads
        const statusResponse = await fetch("/api/downloads/status");
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setDownloadStatus(statusData.data);
        }

        // Iniciar download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast.downloadStarted(product.name, "PDF");
      } else {
        showToast.downloadError(data.error);
      }
    } catch (error) {
      console.error("Erro no download:", error);
      showToast.genericError("Erro ao iniciar download");
    }
  };

  const handleDownloadPSD = async (product: Product) => {
    console.log("🔍 Debug session:", session);
    console.log("🔍 Debug session.user:", session?.user);
    console.log("🔍 Debug session.user.id:", (session?.user as any)?.id);

    if (!(session?.user as any)?.id) {
      showToast.userNotLoggedIn();
      return;
    }

    // Verificar se tem assinatura ativa
    if (
      !downloadStatus?.subscription?.status ||
      (downloadStatus.subscription.status !== "ACTIVE" &&
        downloadStatus.subscription.status !== "TRIALING")
    ) {
      showToast.error(
        "Você precisa de uma assinatura ativa para fazer downloads"
      );
      router.push("/plans");
      return;
    }

    // Verificar se há arquivo PSD disponível
    if (!product.arquivoPdf) {
      showToast.downloadError("Arquivo PSD não disponível para este produto");
      return;
    }

    try {
      const response = await fetch(`/api/download/psd/${product.id}`);
      const data = await response.json();

      if (response.ok) {
        // Atualizar status dos downloads
        const statusResponse = await fetch("/api/downloads/status");
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setDownloadStatus(statusData.data);
        }

        // Iniciar download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast.downloadStarted(product.name, "PSD");
      } else {
        console.error("🔍 Debug Frontend - Erro na API PSD:", data);
        showToast.downloadError(data.error || "Erro desconhecido na API PSD");
      }
    } catch (error) {
      console.error("🔍 Debug Frontend - Erro no download PSD:", error);
      showToast.genericError("Erro ao iniciar download PSD");
    }
  };

  const handleDownloadPNG = async (product: Product) => {
    if (!(session?.user as any)?.id) {
      showToast.userNotLoggedIn();
      return;
    }

    // Verificar se tem assinatura ativa
    if (
      !downloadStatus?.subscription?.status ||
      (downloadStatus.subscription.status !== "ACTIVE" &&
        downloadStatus.subscription.status !== "TRIALING")
    ) {
      showToast.error(
        "Você precisa de uma assinatura ativa para fazer downloads"
      );
      router.push("/plans");
      return;
    }

    // Verificar se há arquivo PNG disponível
    if (!product.arquivoPng) {
      showToast.downloadError("Arquivo PNG não disponível para este produto");
      return;
    }

    try {
      const response = await fetch(`/api/download/png/${product.id}`);
      const data = await response.json();

      if (response.ok) {
        // Atualizar status dos downloads
        const statusResponse = await fetch("/api/downloads/status");
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setDownloadStatus(statusData.data);
        }

        // Iniciar download
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast.downloadStarted(product.name, "PNG");
      } else {
        showToast.downloadError(data.error);
      }
    } catch (error) {
      console.error("Erro no download:", error);
      showToast.genericError("Erro ao iniciar download");
    }
  };

  // Calcular total de páginas para produtos filtrados
  const totalPages = Math.ceil(filteredProducts.length / 12);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <LeftSidebar
        isOpen={isLeftSidebarOpen}
        onToggle={toggleLeftSidebar}
        selectedFileTypes={selectedFileTypes}
        onFileTypeToggle={toggleFileType}
        selectedCategories={selectedCategories}
        onCategoryToggle={toggleCategory}
        categories={categories}
        onClearFilters={clearFilters}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isLeftSidebarOpen ? "lg:ml-80" : "lg:ml-0"
        }`}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6"></h1>
              <p className="text-xl text-muted-foreground mb-8"></p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-card rounded-lg border p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSearch(searchTerm)
                      }
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => handleSearch(searchTerm)}
                    className="px-6"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Pesquisar
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-64">
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
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
              {loading
                ? "Carregando..."
                : `${filteredProducts.length} produtos encontrados`}
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
                {searchTerm || selectedCategory !== "all"
                  ? "Tente ajustar os filtros ou termo de busca"
                  : "Não há produtos disponíveis no momento"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setPagination((prev) => ({ ...prev, page: 1 }));
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
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <ProductImage
                      product={product}
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
                        <Badge
                          key={cat.category.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cat.category.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Product Meta */}
                    <div className="flex items-center justify-end text-sm text-muted-foreground">
                      <span>
                        {new Date(product.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
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
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
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
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    Próxima
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Details Dialog */}
        <Dialog
          open={!!selectedProduct}
          onOpenChange={() => setSelectedProduct(null)}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-1">
                    {/* Imagem Principal */}
                    <div>
                      <div className="relative w-full h-[520px] rounded-lg overflow-hidden">
                        <ProductImage
                          product={selectedProduct}
                          className="w-full rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Detalhes do Produto */}
                    <div className="space-y-4">
                      {/* Nome do Produto */}
                      <div>
                        <h1 className="text-2xl font-bold text-foreground text-right leading-tight pl-4">
                          {selectedProduct.name}
                        </h1>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">
                          Descrição do Produto
                        </h4>
                        <p className="text-muted-foreground">
                          {selectedProduct.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">
                          Categorias
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.categories.map((cat) => (
                            <Badge key={cat.category.id} variant="secondary">
                              {cat.category.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <h4 className="font-semibold mr-2 text-foreground">
                          Avaliação:
                        </h4>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>

                      {/* Botões de Download */}
                      <div className="pt-4">
                        <h4 className="font-semibold mb-3 text-foreground">
                          Downloads Disponíveis
                        </h4>

                        {/* Verificar arquivo PSD disponível */}
                        {selectedProduct.arquivoPdf && (
                          <div className="mb-3">
                            <Button
                              className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                              onClick={() => handleDownloadPSD(selectedProduct)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PSD
                            </Button>
                            <div className="text-xs text-muted-foreground mt-1 space-y-1">
                              <p>Arquivo Photoshop editável disponível</p>
                              <p>Formato: PSD</p>
                            </div>
                          </div>
                        )}

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
                        {!selectedProduct.arquivoPdf &&
                          !selectedProduct.arquivoPng && (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground text-sm">
                                Nenhum arquivo de download disponível para este
                                produto.
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Galeria de Imagens */}
                  {selectedProduct.assets &&
                    selectedProduct.assets.length > 1 && (
                      <div>
                        <h4 className="font-semibold mb-4 text-foreground">
                          Galeria do Produto
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4">
                          {selectedProduct.assets.map((asset, index) => (
                            <div
                              key={asset.id}
                              className="relative aspect-video rounded-lg overflow-hidden"
                            >
                              <Image
                                src={asset.uri}
                                alt={
                                  asset.label ||
                                  `${selectedProduct.name} - Imagem ${
                                    index + 1
                                  }`
                                }
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
    </div>
  );
}
