import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SecondaryNavigation } from "@/components/secondary-navigation" // Importar o novo componente

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kadosh - Biblioteca Digital de Artes Cristãs",
  description:
    "Explore uma vasta coleção de obras de arte cristã digital. Kadosh oferece recursos exclusivos e conhecimento profundo sobre arte sacra.",
  keywords: "arte cristã, biblioteca digital, obras de arte, Kadosh",
  authors: [{ name: "Kadosh" }],
  openGraph: {
    title: "Kadosh - Biblioteca Digital de Artes Cristãs",
    description: "Explore uma vasta coleção de obras de arte cristã digital.",
    type: "website",
    locale: "pt_BR",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body>
        <Header />
        <SecondaryNavigation /> {/* Adicionar a navegação secundária aqui */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
