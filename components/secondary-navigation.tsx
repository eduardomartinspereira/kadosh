import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SecondaryNavigation() {
  const navigationLinks = [
    { name: "SOBRE", href: "/about" },
    { name: "CATÁLOGO", href: "/catalog" },
    { name: "PLANOS", href: "/plans" },
    { name: "CONTATO", href: "/contact" },
  ]

  const thematicLinks = ["CULTO DE DOMINGO", "CONGRESSO DE JOVENS", "CULTO DE MULHERES", "EVENTOS", "CONFERÊNCIAS"]

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

          {/* Thematic Links */}
          {thematicLinks.map((theme, index) => (
            <Button key={index} variant="ghost" className="rounded-full px-4 py-2 text-sm flex-shrink-0">
              <Link href={`/catalog?search=${encodeURIComponent(theme)}`}>{theme}</Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}
