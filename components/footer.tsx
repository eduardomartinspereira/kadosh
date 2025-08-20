import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Instagram, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: "Sobre Nós", href: "/about" },
      { name: "Catálogo", href: "/catalog" },
      { name: "Planos", href: "/plans" },
      { name: "Contato", href: "/contact" },
    ],
    services: [
      { name: "Identidade Visual", href: "/catalog?category=branding" },
      { name: "Design Digital", href: "/catalog?category=digital" },
      { name: "Websites", href: "/catalog?category=web" },
      { name: "Aplicativos", href: "/catalog?category=app" },
    ],
    support: [
      { name: "Central de Ajuda", href: "/help" },
      { name: "Termos de Uso", href: "/terms" },
      { name: "Política de Privacidade", href: "/privacy" },
      { name: "FAQ", href: "/faq" },
    ],
  }

  return (
    <footer className="bg-card text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">KD</span>
              </div>
              <span className="font-bold text-xl">Kadosh</span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Criamos experiências visuais que transformam marcas e negócios. Sua presença online perfeita com design de
              qualidade.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Divinópolis, MG</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">(31) 98602-2600</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">kadosh.suporteonline@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Empresa</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Serviços</h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Suporte</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            

            {/* Social Media */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Siga-nos</h4>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="border-border hover:bg-muted bg-transparent" asChild>
                  <a href="https://www.instagram.com/hd_designer.ofc/" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">© {currentYear} Kadosh. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacidade
            </Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
