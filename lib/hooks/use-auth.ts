"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  loginUser,
  signupUser,
  logoutUser,
  type LoginCredentials,
  type SignupCredentials,
  type AuthResult,
} from "@/lib/actions/auth"

interface UseAuthReturn {
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<AuthResult>
  signup: (credentials: SignupCredentials) => Promise<AuthResult>
  logout: () => Promise<void>
  clearError: () => void
}

/**
 * useAuth Hook
 * 
 * Custom hook for authentication operations with loading states,
 * error handling, and toast notifications.
 * 
 * @example
 * const { login, isLoading, error } = useAuth()
 * const result = await login({ email: "user@example.com", password: "password" })
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginUser(credentials)

      if (result.success) {
        toast.success("Welcome back!", {
          description: `Logged in as ${result.user?.email}`,
        })
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.error || "Login failed")
        toast.error("Login failed", {
          description: result.error || "Please check your credentials and try again",
        })
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(message)
      toast.error("Login error", { description: message })
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const signup = useCallback(async (credentials: SignupCredentials): Promise<AuthResult> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signupUser(credentials)

      if (result.success) {
        if (result.requiresConfirmation) {
          toast.info("Check your email", {
            description: "We've sent a confirmation link to your email address",
          })
        } else {
          toast.success("Account created!", {
            description: "Welcome to Dispatchly",
          })
          router.push("/dashboard")
          router.refresh()
        }
      } else {
        setError(result.error || "Signup failed")
        toast.error("Signup failed", {
          description: result.error || "Please check your information and try again",
        })
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(message)
      toast.error("Signup error", { description: message })
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)

    try {
      await logoutUser()
      toast.success("Logged out successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed"
      toast.error("Logout error", { description: message })
      // Still redirect to login even if logout fails
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return {
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  }
}
