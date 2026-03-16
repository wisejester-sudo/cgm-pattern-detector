"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, BrandButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Plus, MoreVertical, Phone, Mail, User, KeyRound, Send, CheckCircle2, Clock, AlertCircle, Eye, EyeOff, HelpCircle } from "lucide-react"
import { useStore } from "@/lib/store"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TechniciansPage() {
  const { technicians, jobs, addTechnician, updateTechnician, deleteTechnician, loadTechniciansFromSupabase } =
    useStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [invitingTechId, setInvitingTechId] = useState<string | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+1",
    phone: "",
    pin: "",
  })
  const [showPin, setShowPin] = useState(false)
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({})

  // Load technicians from Supabase on mount
  useEffect(() => {
    loadTechniciansFromSupabase()
  }, [loadTechniciansFromSupabase])

  // Normalize phone number to E.164 format
  const normalizePhone = (countryCode: string, phone: string): string => {
    // Remove all non-numeric characters
    const digitsOnly = phone.replace(/\D/g, '')
    
    // If phone already starts with country code, use as-is
    if (digitsOnly.startsWith(countryCode.replace('+', ''))) {
      return `+${digitsOnly}`
    }
    
    // Otherwise, prepend country code
    return `${countryCode}${digitsOnly}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Normalize phone number
    const normalizedPhone = normalizePhone(formData.countryCode, formData.phone)

    try {
      const response = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: normalizedPhone,
          pin: formData.pin,
        }),
      })

      if (response.ok) {
        // Reload from Supabase
        await loadTechniciansFromSupabase()
        toast.success(`${formData.name} added successfully`)
      } else {
        // Fall back to local store
        addTechnician({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          pin: formData.pin,
          is_active: true,
        })
        toast.success(`${formData.name} added locally`)
      }
    } catch {
      // Fall back to local store on error
      addTechnician({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pin: formData.pin,
        is_active: true,
      })
      toast.success(`${formData.name} added locally`)
    }

    setFormData({ name: "", email: "", countryCode: "+1", phone: "", pin: "" })
    setIsLoading(false)
    setIsAddOpen(false)
  }

  const handleToggleActive = (techId: string, currentActive: boolean) => {
    updateTechnician(techId, { is_active: !currentActive })
  }

  const handleDelete = async (techId: string) => {
    await deleteTechnician(techId)
    // Reload from Supabase to ensure deletion is reflected
    await loadTechniciansFromSupabase()
    toast.success('Technician deleted')
  }

  const togglePinVisibility = (techId: string) => {
    setVisiblePins(prev => ({
      ...prev,
      [techId]: !prev[techId]
    }))
  }

  const handleSendInvite = async (techId: string, method: 'sms' | 'email' = 'sms') => {
    console.log('[Frontend] Sending invite for tech:', techId, 'via:', method)
    setInvitingTechId(techId)
    try {
      const response = await fetch('/api/technicians/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: techId, method }),
      })

      console.log('[Frontend] Response status:', response.status)
      
      const data = await response.json()
      console.log('[Frontend] Response data:', data)

      if (response.ok) {
        setInviteLink(data.magicLink)
        setShowInviteDialog(true)
        // Update last invited timestamp in store
        const technician = technicians.find(t => t.id === techId)
        if (technician) {
          updateTechnician(techId, { 
            ...technician,
            invited_at: new Date().toISOString()
          })
        }
        toast.success(data.smsSent ? 'Invite sent via SMS!' : 'Invite link generated')
      } else {
        console.error('[Frontend] API error:', data.error)
        toast.error(data.error || 'Failed to generate invite link')
      }
    } catch (error) {
      console.error('[Frontend] Error sending invite:', error)
      toast.error('Failed to send invite - check console')
    } finally {
      setInvitingTechId(null)
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied to clipboard')
  }

  const getAssignedJobCount = (techId: string) => {
    return jobs.filter(
      (j) => j.assigned_tech_id === techId && j.status !== "complete"
    ).length
  }

  const isValid = formData.name && formData.phone && formData.pin

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Technicians</h1>
          <p className="text-muted-foreground">
            Manage your field technicians
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <BrandButton>
              <Plus className="mr-2 h-4 w-4" />
              Add Technician
            </BrandButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Technician</DialogTitle>
              <DialogDescription>
                Enter the technician details. They will receive an SMS with their access link.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email (Optional)</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tech@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <div className="flex gap-2">
                    <select
                      id="countryCode"
                      className="w-24 px-3 py-2 border rounded-md text-sm bg-background"
                      value={formData.countryCode}
                      onChange={(e) =>
                        setFormData({ ...formData, countryCode: e.target.value })
                      }
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+55">🇧🇷 +55</option>
                    </select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="flex-1"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter number in any format - we'll normalize it automatically
                  </p>
                </Field>
                <Field>
                  <div className="flex items-center gap-2">
                    <FieldLabel htmlFor="pin">Login PIN (4 digits)</FieldLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>The technician enters this PIN after clicking the magic link to verify their identity. This adds a security layer - even if someone intercepts the SMS, they need the PIN to access the platform.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      id="pin"
                      type={showPin ? "text" : "password"}
                      placeholder="1234"
                      maxLength={4}
                      value={formData.pin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pin: e.target.value.replace(/\D/g, "").slice(0, 4),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </Field>
              </FieldGroup>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <BrandButton type="submit" disabled={!isValid || isLoading}>
                  {isLoading && <Spinner className="mr-2" />}
                  Add Technician
                </BrandButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Technicians Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {technicians.map((tech) => {
          const assignedJobs = getAssignedJobCount(tech.id)
          const hasAccessed = !!tech.accessed_at
          const lastAccessed = tech.last_active_at 
            ? new Date(tech.last_active_at).toLocaleDateString() 
            : null
          
          return (
            <Card key={tech.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tech.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={tech.is_active ? "default" : "secondary"}
                        >
                          {tech.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {hasAccessed && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Accessed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(tech.id, tech.is_active)}
                      >
                        {tech.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(tech.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Access Status */}
                <div className="mt-2 text-xs">
                  {hasAccessed ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Last accessed: {lastAccessed || 'Recently'}
                    </span>
                  ) : tech.invited_at ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Invited {new Date(tech.invited_at).toLocaleDateString()} - Awaiting access
                    </span>
                  ) : (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Never invited
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{tech.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{tech.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                  <span className="font-mono">PIN: {visiblePins[tech.id] ? tech.pin : '****'}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={() => togglePinVisibility(tech.id)}
                  >
                    {visiblePins[tech.id] ? (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Eye className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <div className="pt-2 border-t border-border">
                  <span className="text-sm">
                    <span className="font-medium">{assignedJobs}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      active job{assignedJobs !== 1 ? "s" : ""}
                    </span>
                  </span>
                </div>
                
                {/* Prominent Invite Buttons */}
                {!hasAccessed && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {tech.phone && (
                      <BrandButton
                        onClick={() => handleSendInvite(tech.id, 'sms')}
                        disabled={invitingTechId === tech.id}
                        className="flex-1"
                      >
                        {invitingTechId === tech.id && <Spinner className="h-4 w-4 mr-2" />}
                        Send Platform Access Link
                      </BrandButton>
                    )}
                    {tech.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendInvite(tech.id, 'email')}
                        disabled={invitingTechId === tech.id}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send via Email
                      </Button>
                    )}
                  </div>
                )}
                
                {hasAccessed && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendInvite(tech.id, 'sms')}
                      disabled={invitingTechId === tech.id}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Resend Invite
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {technicians.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No technicians yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first technician to get started
          </p>
        </div>
      )}

      <AlertDialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Technician Invite Link</AlertDialogTitle>
            <AlertDialogDescription>
              Share this link with your technician. They can use it to set up their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg border border-border break-all text-sm font-mono">
              {inviteLink}
            </div>
            <p className="text-xs text-muted-foreground">
              This link will expire in 7 days. You can generate a new one by clicking "Send Invite Link" again.
            </p>
          </div>
          <AlertDialogCancel className="mr-2">Close</AlertDialogCancel>
          <AlertDialogAction onClick={copyInviteLink} className="bg-primary">
            Copy Link
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
