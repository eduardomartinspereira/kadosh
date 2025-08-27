// Configuração centralizada para imagens
export const IMAGE_CONFIG = {
  // Domínios permitidos para imagens externas
  allowedDomains: [
    'images.unsplash.com',
    'picsum.photos',
    'loremflickr.com',
    'placehold.co',
    'placekitten.com'
  ],
  
  // Imagem padrão para fallback
  defaultPlaceholder: '/placeholder.svg',
  
  // Tamanhos padrão para diferentes contextos
  sizes: {
    thumbnail: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    modal: '(max-width: 768px) 100vw, 50vw',
    full: '100vw'
  },
  
  // Configurações de qualidade
  quality: 85,
  
  // Formatos suportados
  formats: ['image/webp', 'image/avif', 'image/jpeg', 'image/png'],
  
  // Breakpoints para responsividade
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
}

// Função para validar se uma URL de imagem é permitida
export function isAllowedImageDomain(url: string): boolean {
  if (!url) return false
  
  try {
    const urlObj = new URL(url)
    return IMAGE_CONFIG.allowedDomains.includes(urlObj.hostname)
  } catch {
    // Se não for uma URL válida, assumir que é local
    return true
  }
}

// Função para obter a imagem com fallback
export function getImageWithFallback(
  primaryImage?: string | null,
  fallbackImages?: Array<{ url: string }> | null,
  defaultImage: string = IMAGE_CONFIG.defaultPlaceholder
): string {
  try {
    // Priorizar imagem principal
    if (primaryImage && primaryImage.trim() !== '') {
      return primaryImage
    }
    
    // Usar primeira imagem do array de fallback
    if (fallbackImages && Array.isArray(fallbackImages) && fallbackImages.length > 0) {
      const firstImage = fallbackImages[0]
      if (firstImage?.url && firstImage.url.trim() !== '') {
        return firstImage.url
      }
    }
    
    // Retornar imagem padrão
    return defaultImage
  } catch (error) {
    console.warn('Erro ao obter imagem:', error)
    return defaultImage
  }
}

// Função para gerar srcSet para imagens responsivas
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [640, 768, 1024, 1280, 1536]
): string {
  return widths
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ')
} 