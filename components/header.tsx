"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Menu, Search, User, ChevronDown, Star, Download } from "lucide-react";
import type { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<any>(null);
  const { searchTerm, setSearchTerm } = useSearch();
  const { data: session } = useSession();

  const router = useRouter();

  // Buscar status de downloads quando usuário estiver logado
  useEffect(() => {
    if (session?.user) {
      const fetchDownloadStatus = async () => {
        try {
          const response = await fetch("/api/downloads/status");
          if (response.ok) {
            const data = await response.json();
            setDownloadStatus(data.data);
          }
        } catch (error) {
          console.error("Erro ao buscar status de downloads:", error);
        }
      };

      fetchDownloadStatus();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <img
              src="/logoKadosh.svg"
              alt="Kadosh Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Barra de Pesquisa - Centralizada */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sessão / Ações */}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm hidden sm:inline">
                Olá, {session.user?.name ?? "usuário"}
              </span>

              {/* Contador de Downloads - só aparece se tiver assinatura */}
              {downloadStatus?.subscription?.status &&
                (downloadStatus.subscription.status === "ACTIVE" ||
                  downloadStatus.subscription.status === "TRIALING") && (
                  <div className="hidden md:flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-lg border px-3 py-2 shadow-sm">
                    <Download className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {downloadStatus.limits.daily.current}/
                        {downloadStatus.limits.daily.max}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Downloads Hoje
                      </div>
                    </div>
                  </div>
                )}

              <Button onClick={handleSignOut} aria-label="Sair da conta">
                Sair
              </Button>

              {/* Botão Seja Premium */}
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Link href="/plans">
                  <Star className="h-4 w-4 mr-2" />
                  Seja Premium
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm"></span>
              <Button asChild size="sm">
                <Link href="/auth/login">
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Link>
              </Button>

              {/* Botão Seja Premium */}
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Link href="/plans">
                  <Star className="h-4 w-4 mr-2" />
                  Seja Premium
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
