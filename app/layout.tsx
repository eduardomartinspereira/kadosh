import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SecondaryNavigation } from '@/components/secondary-navigation';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type React from 'react';
import './globals.css';
import { getServerSession } from 'next-auth';
import AuthProvider from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Kadosh - Biblioteca Digital de Artes Cristãs',
    description:
        'Explore uma vasta coleção de obras de arte cristã digital. Kadosh oferece recursos exclusivos e conhecimento profundo sobre arte sacra.',
    keywords: 'arte cristã, biblioteca digital, obras de arte, Kadosh',
    authors: [{ name: 'Kadosh' }],
    openGraph: {
        title: 'Kadosh - Biblioteca Digital de Artes Cristãs',
        description:
            'Explore uma vasta coleção de obras de arte cristã digital.',
        type: 'website',
        locale: 'pt_BR',
    },
    generator: 'v0.app',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession();
    return (
        <html lang="pt-BR" className="dark">
            <head>
                <script src="https://sdk.mercadopago.com/js/v2"></script>
            </head>
            <body>
                <AuthProvider session={session}>
                    <Header />
                    <SecondaryNavigation />
                    <main>{children}</main>
                    <Footer />
                </AuthProvider>
            </body>
        </html>
    );
}
