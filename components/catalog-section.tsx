"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  Filter,
  Share2,
  Eye,
  Image as ImageIcon,
  Download,
  AlertCircle,
  ExternalLink,
  Search,
} from "lucide-react";
import Image from "next/image";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useSession } from "next-auth/react";
import { showToast } from "@/lib/toast-config";
import { useSearch } from "@/context/SearchContext";
import { useRouter } from "next/navigation";

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
  imageTypes?: string[];
  createdAt: string;
  categories: Array<{
    category: Category;
  }>;
  assets: ProductAsset[];
  img2?: string;
  linkCanvas?: string;
}

interface CatalogSectionProps {
  selectedFileTypes?: string[];
  selectedCategories?: string[];
  onSearchClick?: () => void;
}

export default function CatalogSection({
  selectedFileTypes = [],
  selectedCategories = [],
  onSearchClick,
}: CatalogSectionProps) {
  const { data: session, status } = useSession();
  const { searchTerm, setSearchTerm, updateSearchFromURL, clearSearch } =
    useSearch();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadStatus, setDownloadStatus] = useState<any>(null);

  // Processar parâmetros de URL para pesquisa
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.hash.split("?")[1]);
      const searchParam = urlParams.get("search");
      if (searchParam) {
        updateSearchFromURL(searchParam);
      }
    }
  }, [updateSearchFromURL]);

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

  // Filtrar produtos baseado na pesquisa, categoria e filtros da sidebar
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filtrar por categoria (dropdown)
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) =>
        product.categories.some((cat) => cat.category.slug === selectedCategory)
      );
    }

    // Filtrar por termo de pesquisa
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();

      // Filtro por nome/descrição/categoria
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.categories.some((cat) =>
            cat.category.name.toLowerCase().includes(searchLower)
          )
      );
    }

    // Filtro por tipo de arquivo (sidebar)
    if (selectedFileTypes.length > 0) {
      filtered = filtered.filter((product) => {
        // Verificar se o produto tem imageTypes e se contém algum dos tipos selecionados
        if (product.imageTypes && Array.isArray(product.imageTypes)) {
          return selectedFileTypes.some((fileType) =>
            product.imageTypes!.includes(fileType.toUpperCase())
          );
        }
        return false;
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
    selectedCategory,
    searchTerm,
    selectedFileTypes,
    selectedCategories,
  ]);

  // Função para obter imagem do produto
  const getProductImage = (product: Product) => {
    if (product.mainImage) {
      return product.mainImage;
    }

    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }

    // Fallback para imagem padrão
    return "/placeholder.svg";
  };

  // Função para obter imagem do modal (img2)
  const getModalImage = (product: Product) => {
    if (product.img2) {
      return product.img2;
    }

    if (product.mainImage) {
      return product.mainImage;
    }

    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    }

    // Fallback para imagem padrão
    return "/placeholder.svg";
  };

  // Função para abrir link do Canva
  const handleOpenCanvaLink = async (product: Product) => {
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

    if (!product.linkCanvas) {
      showToast.error("Link do Canva não disponível para este produto");
      return;
    }

    try {
      // Chamar API para contabilizar o download
      const response = await fetch(`/api/download/canva/${product.id}`);
      const data = await response.json();

      if (response.ok) {
        // Atualizar status dos downloads
        const statusResponse = await fetch("/api/downloads/status");
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setDownloadStatus(statusData.data);
        }

        // Abrir link do Canva
        window.open(product.linkCanvas, "_blank");
        showToast.downloadStarted(product.name, "Canva");
      } else {
        showToast.downloadError(data.error || "Erro ao acessar Canva");
      }
    } catch (error) {
      console.error("Erro ao acessar Canva:", error);
      showToast.genericError("Erro ao acessar Canva");
    }
  };

  // Função para obter nomes das categorias
  const getCategoryNames = (product: Product) => {
    return product.categories.map((cat) => cat.category.name).join(", ");
  };

  // Funções de download
  const handleDownloadPDF = async (product: Product) => {
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
        console.error("🔍 Debug Frontend - Erro na API PDF:", data);
        showToast.downloadError(data.error || "Erro desconhecido na API PDF");
      }
    } catch (error) {
      console.error("🔍 Debug Frontend - Erro no download PDF:", error);
      showToast.genericError("Erro ao iniciar download PDF");
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

  const handleDownloadPSD = async (product: Product) => {
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

  // Componente para imagem do produto com fallback
  const ProductImage = ({
    product,
    className,
  }: {
    product: Product;
    className?: string;
  }) => (
    <img
      src={getProductImage(product)}
      alt={product.name}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/placeholder.svg";
      }}
    />
  );

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
    );
  }

  return (
    <section id="catalog" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 rounded-lg mb-12 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/pesquisa.png"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6"></h2>
            <p className="text-xl text-muted-foreground mb-8"></p>

            {/* Barra de Pesquisa Centralizada */}
            <div className="max-w-2xl mx-auto mt-24">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={onSearchClick}
                  className="pl-10 bg-background/80 border-border/50 focus:border-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="w-full md:w-80">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
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

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                Filtros ativos:
              </span>

              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
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
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Categoria:{" "}
                  {categories.find((c) => c.slug === selectedCategory)?.name}
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
                  clearSearch();
                  setSelectedCategory("all");
                }}
                className="text-xs"
              >
                Limpar filtros
              </Button>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            {filteredProducts.length} produtos encontrados
            {(selectedFileTypes.length > 0 ||
              selectedCategories.length > 0) && (
              <span className="ml-2 text-blue-600 font-medium">
                (filtros ativos)
              </span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border border-border">
                {/* Imagem do Produto - Adaptando ao tamanho da imagem */}
                <div className="w-full">
                  <ProductImage
                    product={product}
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* Badge da Categoria */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-black/70 text-white text-xs"
                  >
                    {product.categories[0]?.category.name || "Sem categoria"}
                  </Badge>
                </div>

                {/* Overlay com informações ao hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      Clique para ver detalhes
                    </p>
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
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `Nenhum produto encontrado para "${searchTerm}"`
                : "Nenhum produto disponível no momento."}
            </p>
          </div>
        )}

        {/* Product Detail Modal */}
        <Dialog
          open={!!selectedProduct}
          onOpenChange={() => setSelectedProduct(null)}
        >
          <DialogContent className="max-w-7xl h-[70vh] overflow-y-auto scrollbar-hide">
            {selectedProduct && (
              <>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Imagem Principal */}
                    <div>
                      <div className="relative w-full h-[520px] rounded-lg overflow-hidden">
                        <img
                          src={getModalImage(selectedProduct)}
                          alt={selectedProduct.name}
                          className="w-full h-full object-contain rounded-lg"
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

                      {/* Tipos de Imagem */}
                      {selectedProduct.imageTypes &&
                        selectedProduct.imageTypes.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-foreground">
                              Tipos de Arquivo
                            </h4>
                            <div className="flex items-center gap-3">
                              {selectedProduct.imageTypes.map((type) => {
                                let iconSrc = "";
                                let altText = "";

                                switch (type) {
                                  case "PSD":
                                    iconSrc = "/photoshop.png";
                                    altText = "Photoshop";
                                    break;
                                  case "PNG":
                                    iconSrc = "/png.png";
                                    altText = "PNG";
                                    break;
                                  case "CANVA":
                                    iconSrc = "/canva.png";
                                    altText = "Canva";
                                    break;
                                  default:
                                    return null;
                                }

                                return (
                                  <div
                                    key={type}
                                    className="flex items-center gap-2"
                                  >
                                    <img
                                      src={iconSrc}
                                      alt={altText}
                                      className="w-6 h-6 object-contain"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {type}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      {/* Botões de Download */}
                      <div className="pt-4">
                        <h4 className="font-semibold mb-3 text-foreground">
                          Downloads Disponíveis
                        </h4>

                        {/* Botões de Download lado a lado */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          {/* Verificar arquivo PSD disponível (usando arquivoPdf) */}
                          {selectedProduct.arquivoPdf && (
                            <Button
                              variant="outline"
                              className="bg-blue-600 text-white hover:bg-blue-700 sm:w-80 h-12"
                              onClick={() => handleDownloadPSD(selectedProduct)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PSD
                            </Button>
                          )}

                          {/* Verificar arquivo PDF disponível */}
                          {/* {selectedProduct.arquivoPdf && ( 
                            <Button
                              variant="outline"
                              className="bg-red-600 text-white hover:bg-red-700 sm:w-80 h-12"
                              onClick={() => handleDownloadPDF(selectedProduct)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </Button>
                          )}*/}

                          {/* Verificar arquivo PNG disponível */}
                          {selectedProduct.arquivoPng && (
                            <Button
                              variant="outline"
                              className="bg-green-600 text-white hover:bg-green-700 sm:w-80 h-12"
                              onClick={() => handleDownloadPNG(selectedProduct)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PNG
                            </Button>
                          )}

                          {/* Link do Canva */}
                          {selectedProduct.linkCanvas && (
                            <Button
                              className="bg-purple-600 hover:bg-purple-700 text-white sm:w-80 h-12"
                              onClick={() =>
                                handleOpenCanvaLink(selectedProduct)
                              }
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Link do Canva
                            </Button>
                          )}
                        </div>

                        {/* Mensagem quando não há downloads disponíveis */}
                        {!selectedProduct.arquivoPdf &&
                          !selectedProduct.arquivoPng &&
                          !selectedProduct.linkCanvas && (
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
    </section>
  );
}
