"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"

import { Menu, Search, User, Phone } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = () => {
    // Implement search logic, e.g., redirect to catalog with search params
    console.log("Searching:", searchTerm)
    // Example: router.push(`/catalog?search=${searchTerm}`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">KD</span>
            </div>
            <span className="font-bold text-xl text-foreground">Kadosh</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-grow max-w-2xl items-center space-x-2 bg-background rounded-md border border-border px-2 py-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar imagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              className="flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground placeholder:text-muted-foreground"
            />

            <Button size="sm" onClick={handleSearch}>
              Pesquisar
            </Button>
          </div>

          {/* Desktop CTA & Auth */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">

            <Button variant="outline" asChild>
              <Link href="/auth/register">Cadastre-se</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">
                <User className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-card border-border">
              <div className="flex flex-col space-y-4 mt-8">
                {/* Mobile Search Bar */}
                <div className="relative flex items-center space-x-2 bg-background rounded-md border border-border px-2 py-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                    className="flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground placeholder:text-muted-foreground"
                  />
                  <Button size="sm" onClick={handleSearch}>
                    Buscar
                  </Button>
                </div>


                {/* Mobile Navigation Links */}
                {/* These links will be duplicated in SecondaryNavigation for desktop, but needed here for mobile */}
                <Link
                  href="/"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Início
                </Link>
                <Link
                  href="/about"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sobre
                </Link>
                <Link
                  href="/catalog"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Catálogo
                </Link>
                <Link
                  href="/plans"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Planos
                </Link>
                <Link
                  href="/contact"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Contato
                </Link>

                <div className="pt-4 space-y-2">
                  
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      Cadastre-se
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Entrar
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
