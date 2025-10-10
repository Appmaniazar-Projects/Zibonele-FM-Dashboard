"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getFirebaseInstances } from "@/lib/firebase"

interface User {
  email: string
  displayName?: string
  uid: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isUsingRealFirebase: boolean
  connectionError: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isUsingRealFirebase: false,
  connectionError: null,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUsingRealFirebase, setIsUsingRealFirebase] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupAuth = async () => {
      try {
        console.log("🔐 Setting up authentication for Dashboard...")

        // Check if we have Firebase config
        const hasConfig =
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

        if (!hasConfig) {
          console.error("❌ Missing Firebase configuration in .env.local")
          setConnectionError(
            "Missing Firebase configuration. Please update your .env.local file with real Firebase credentials.",
          )
          setLoading(false)
          return
        }

        const { auth, isUsingRealFirebase: usingReal } = await getFirebaseInstances()

        setIsUsingRealFirebase(usingReal)
        console.log("🔥 Firebase status:", usingReal ? "Real Firebase Connected" : "Mock Firebase")

        if (!auth) {
          throw new Error("No auth instance available")
        }

        unsubscribe = auth.onAuthStateChanged(
          (firebaseUser: any) => {
            console.log("🔐 Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "No user")
            setUser(firebaseUser)
            setLoading(false)
            setConnectionError(null)
          },
          (error: any) => {
            console.error("❌ Auth state change error:", error)
            setConnectionError("Authentication error occurred")
            setLoading(false)
          },
        )

        console.log("✅ Auth listener set up successfully")
      } catch (error: any) {
        console.error("❌ Error setting up auth:", error.message)
        setConnectionError(error.message || "Failed to connect to Firebase")
        setUser(null)
        setLoading(false)
        setIsUsingRealFirebase(false)
      }
    }

    setupAuth()

    return () => {
      if (unsubscribe) {
        console.log("🔌 Cleaning up auth listener")
        unsubscribe()
      }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isUsingRealFirebase, connectionError }}>
      {children}
    </AuthContext.Provider>
  )
}
