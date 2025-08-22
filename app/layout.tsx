import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { SecondaryNavigation } from '@/components/secondary-navigation'; // Importar o novo componente
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { SessionProviderCustom } from './context/SessionContext';

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
    const session = await getServerSession(authOptions);
    return (
        <html lang="pt-BR" className="dark">
            <body>
                <SessionProviderCustom initialSession={session}>
                    <Header />
                    <SecondaryNavigation />
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        theme="light"
                        newestOnTop
                        closeOnClick
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                    <main>{children}</main>
                    <Footer />
                </SessionProviderCustom>
            </body>
        </html>
    );
}
