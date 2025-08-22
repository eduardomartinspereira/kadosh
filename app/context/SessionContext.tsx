"use client"
import { createContext, useContext, useState } from "react"
import type { Session } from "next-auth"

type SessionContextType = {
    session: Session | null
    setSession: (session: Session | null) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProviderCustom({ children, initialSession }: { children: React.ReactNode, initialSession: Session | null }) {
    const [session, setSession] = useState<Session | null>(initialSession)
    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    )
}

export function useCustomSession() {
    const ctx = useContext(SessionContext)
    if (!ctx) throw new Error("useCustomSession precisa estar dentro do SessionProviderCustom")
    return ctx
}
