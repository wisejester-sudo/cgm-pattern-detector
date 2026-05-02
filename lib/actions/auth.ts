"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { logger } from "@/lib/logger"

// Types for auth actions
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  companyName: string
  ownerName?: string
  companyPhone?: string
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: {
    id: string
    email: string
    full_name?: string
    company_name?: string
  }
  requiresConfirmation?: boolean
}

/**
 * Server action to log in a user
 * Validates credentials and creates session
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: "Authentication service unavailable" }
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore errors during set
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      logger.warn("Login failed:", error.message)
      return { success: false, error: error.message || "Invalid credentials" }
    }

    if (!data.user) {
      return { success: false, error: "Login failed" }
    }

    revalidatePath("/", "layout")
    
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || "",
        full_name: data.user.user_metadata?.full_name,
        company_name: data.user.user_metadata?.company_name,
      },
    }
  } catch (error) {
    logger.error("Login error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Server action to sign up a new user
 * Creates user account and company profile
 */
export async function signupUser(credentials: SignupCredentials): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: "Authentication service unavailable" }
    }

    // Validate password
    if (credentials.password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" }
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore errors during set
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.ownerName || credentials.email.split("@")[0],
          company_name: credentials.companyName,
          company_phone: credentials.companyPhone,
          role: "admin",
        },
      },
    })

    if (error) {
      logger.warn("Signup failed:", error.message)
      return { success: false, error: error.message || "Signup failed" }
    }

    if (!data.user) {
      return { success: false, error: "Signup failed" }
    }

    revalidatePath("/", "layout")

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || "",
        full_name: credentials.ownerName,
        company_name: credentials.companyName,
      },
      requiresConfirmation: !data.session,
    }
  } catch (error) {
    logger.error("Signup error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

/**
 * Server action to log out the current user
 * Clears session and redirects to login
 */
export async function logoutUser(): Promise<void> {
  try {
    const cookieStore = await cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      redirect("/login")
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore errors during set
            }
          },
        },
      }
    )

    await supabase.auth.signOut()
    
    revalidatePath("/", "layout")
    redirect("/login")
  } catch (error) {
    logger.error("Logout error:", error)
    redirect("/login")
  }
}

/**
 * Server action to get current session
 * Returns user data if authenticated
 */
export async function getCurrentSession(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: "Authentication service unavailable" }
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore errors during set
            }
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return { success: false, error: "Not authenticated" }
    }

    return {
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email || "",
        full_name: session.user.user_metadata?.full_name,
        company_name: session.user.user_metadata?.company_name,
      },
    }
  } catch (error) {
    logger.error("Session check error:", error)
    return { success: false, error: "Failed to check session" }
  }
}
