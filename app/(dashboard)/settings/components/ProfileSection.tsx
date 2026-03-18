"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { useStore } from "@/lib/store"
import { User, Mail, Phone, Loader2, Check } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company_name: string | null
  company_phone: string | null
  role: 'admin' | 'technician'
}

export function ProfileSection() {
  const { refreshUserProfile } = useStore()
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [ownerName, setOwnerName] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [ownerEmail, setOwnerEmail] = useState("")
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/user-profile')
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
          setOwnerName(data.full_name || "")
          setOwnerPhone(data.phone || "")
          setOwnerEmail(data.email || "")
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    setProfileError(null)
    
    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerName,
          email: ownerEmail,
          phone: ownerPhone,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success('Profile updated successfully')
        setIsEditingProfile(false)
        
        // Update local state with returned profile
        if (data.profile) {
          setOwnerName(data.profile.full_name || data.profile.name || '')
          setOwnerEmail(data.profile.email || '')
          setOwnerPhone(data.profile.phone || '')
        }
        
        // Refresh store data to update header and navigation
        await refreshUserProfile()
      } else {
        console.error('[Frontend] Profile update failed:', data)
        setProfileError(data.error || 'Failed to update profile')
        toast.error(`Error: ${data.error || 'Failed to update profile'}`)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      setProfileError('Failed to save profile')
      toast.error('Failed to save profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    // Reset to original values
    if (userProfile) {
      setOwnerName(userProfile.full_name || "")
      setOwnerPhone(userProfile.phone || "")
      setOwnerEmail(userProfile.email || "")
    }
    setProfileError(null)
  }

  if (profileLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Owner Profile</CardTitle>
          <CardDescription>Loading profile information...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Owner Profile</CardTitle>
            <CardDescription>
              Manage your personal information and contact details
            </CardDescription>
          </div>
          {!isEditingProfile && (
            <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {profileError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {profileError}
          </div>
        )}
        
        <FieldGroup>
          <Field>
            <FieldLabel className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </FieldLabel>
            {isEditingProfile ? (
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter your full name"
                disabled={profileSaving}
              />
            ) : (
              <div className="p-2 rounded-md bg-muted text-sm">
                {ownerName || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </FieldLabel>
            {isEditingProfile ? (
              <Input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={profileSaving}
              />
            ) : (
              <div className="p-2 rounded-md bg-muted text-sm">
                {ownerEmail || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </FieldLabel>
            {isEditingProfile ? (
              <Input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Enter your phone number"
                disabled={profileSaving}
              />
            ) : (
              <div className="p-2 rounded-md bg-muted text-sm">
                {ownerPhone || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </Field>

          {isEditingProfile && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="flex-1"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={profileSaving}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
