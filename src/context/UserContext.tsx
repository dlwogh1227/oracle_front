// UserContext.tsx
import { createContext, useContext, useState, useEffect } from "react"

type User = {
    username: string
    role: string
}

type UserContextType = {
    user: User | null
    setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        fetch("/api/public/user/me", { credentials: "include" })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) setUser(data)
            })
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
    const context = useContext(UserContext)
    if (!context) throw new Error("useUser must be used within a UserProvider")
    return context
}
