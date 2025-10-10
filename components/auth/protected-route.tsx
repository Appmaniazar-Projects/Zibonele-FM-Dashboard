"use client"

import type React from "react"
import { useAuth } from "./auth-provider"
import { LoginForm } from "./login-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Settings } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isUsingRealFirebase, connectionError } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-radio-gray">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-radio-gold mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading authentication...</p>
          
          {connectionError && (
            <Alert className="mt-4 border-radio-red/50 bg-radio-red/10 text-left">
              <AlertCircle className="h-4 w-4 text-radio-red" />
              <AlertDescription className="text-radio-red text-sm">{connectionError}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    )
  }

  if (connectionError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-radio-gray p-4">
        <div className="max-w-md w-full">
          <Alert className="border-radio-red/50 bg-radio-red/10">
            <AlertCircle className="h-4 w-4 text-radio-red" />
            <AlertDescription className="text-radio-red">
              <div className="space-y-2">
                <p className="font-medium">Firebase Configuration Error</p>
                <p className="text-sm">{connectionError}</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center space-x-2 mb-3">
              <Settings className="h-5 w-5 text-radio-gold" />
              <h3 className="text-white font-medium">Setup Required</h3>
            </div>
            <div className="text-white/70 text-sm space-y-2">
              <p>
                Please update your <code className="bg-black/30 px-1 rounded">.env.local</code> file with your real
                Firebase credentials:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
                <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
                <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
              </ul>
              <p className="mt-2">
                You can find these in your Firebase Console → Project Settings → General → Your apps
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <>{children}</>
}
