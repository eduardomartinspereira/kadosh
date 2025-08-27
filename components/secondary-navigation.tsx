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
        <div className="flex items-center gap-x-4 pb-2 overflow-x-auto">
          {/* Categorias Dinâmicas - Com scroll horizontal */}
          {!loading && (
            <div className="flex items-center gap-x-3">
              {categories.map((category) => (
                <Button 
                  key={category.id} 
                  variant="ghost" 
                  className="rounded-full px-3 py-2 text-sm whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {category.name.toUpperCase()}
                </Button>
              ))}
            </div>
          )}

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
