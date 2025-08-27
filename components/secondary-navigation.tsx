"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/context/SearchContext"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

export function SecondaryNavigation() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { setSearchTerm } = useSearch()

  // Buscar categorias do banco
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
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const navigationLinks = [
    { name: "SOBRE", href: "/about" },
    { name: "CATÁLOGO", href: "#catalog" },
    { name: "PLANOS", href: "/plans" },
    { name: "CONTATO", href: "/contact" },
  ]

  const handleCategoryClick = (categoryName: string) => {
    // Atualizar o termo de pesquisa para filtrar por categoria
    setSearchTerm(categoryName)
    
    // Rolar para o catálogo
    const catalogSection = document.getElementById('catalog')
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="hidden md:block w-full border-b border-border bg-card py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-x-4 pb-2">
          {/* Navigation Links */}
          {navigationLinks.map((item) => (
            <Button key={item.name} variant="ghost" className="rounded-full px-4 py-2 text-sm flex-shrink-0">
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}

          {/* Categorias Dinâmicas */}
          {!loading && categories.map((category) => (
            <Button 
              key={category.id} 
              variant="ghost" 
              className="rounded-full px-4 py-2 text-sm flex-shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleCategoryClick(category.name)}
            >
              {category.name.toUpperCase()}
            </Button>
          ))}

          {/* Loading state */}
          {loading && (
            <div className="flex gap-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="w-20 h-8 bg-muted animate-pulse rounded-full"></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
