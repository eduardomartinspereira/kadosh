"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Menu, Search, User } from "lucide-react"
import type { Session } from "next-auth"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { data: session } = useSession()

  const router = useRouter();

  const handleSearch = () => {
    console.log("Searching:", searchTerm)
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace("/");
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

          {/* Sessão / Ações */}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm hidden sm:inline">
                Olá, {session.user?.name ?? "usuário"}
              </span>
              <Button
                onClick={handleSignOut}
                aria-label="Sair da conta"
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm">Você não está logado</span>
              <Button asChild size="sm">
                <Link href="/auth/login">
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
