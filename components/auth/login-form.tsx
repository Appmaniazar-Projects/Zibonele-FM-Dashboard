"use client"

import type React from "react"
import { useState } from "react"
import { getFirebaseInstances } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"
import Image from "next/image"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      setLoading(false)
      setError("Please enter both email and password.")
      return
    }

    try {
      console.log("🔐 Attempting sign in with Firebase...")
      const { auth, isUsingRealFirebase } = await getFirebaseInstances()

      if (isUsingRealFirebase) {
        // Use real Firebase authentication
        const { signInWithEmailAndPassword } = await import("firebase/auth")
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword)
        console.log("✅ Real Firebase sign in successful")
      } else {
        // Fallback to mock (shouldn't happen with real config)
        await auth.signInWithEmailAndPassword(cleanEmail, cleanPassword)
        console.log("✅ Mock sign in successful")
      }
    } catch (error: any) {
      console.error("❌ Sign in error:", error)

      // Handle specific Firebase auth errors
      let errorMessage = "Sign in failed. Please try again."

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later."
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please check your credentials."
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-radio-gray p-4">
      <Card className="w-full max-w-md bg-radio-black border-radio-gold/30 text-white">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-white/5 p-4 rounded-lg">
              <Image
                src="/images/zibonele-logo.png"
                alt="Zibonele Radio Logo"
                width={120}
                height={50}
                className="object-contain"
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-radio-gold">Staff Dashboard</CardTitle>
            <CardDescription className="text-white/70">Sign in to access the radio management system</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-radio-red/50 bg-radio-red/10 animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 text-radio-red" />
              <AlertDescription className="text-radio-red text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-radio-gold" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your staff email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-radio-gold" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-radio-gold hover:text-radio-gold/80"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-radio-gold text-radio-black hover:bg-radio-gold/90 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-radio-black mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-white/70 space-y-2">
            <p>Staff access only</p>
            <p className="text-xs">Contact your administrator if you need access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
