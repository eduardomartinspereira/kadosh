'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import type { Session } from 'next-auth';

export default function AuthProvider({ 
    children, 
    session 
}: { 
    children: React.ReactNode;
    session: Session | null;
}) {
    return (
        <SessionProvider session={session}>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                theme="dark"
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </SessionProvider>
    );
}
