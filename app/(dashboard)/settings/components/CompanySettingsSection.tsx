"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { useStore } from "@/lib/store"
import { Building, Phone, Palette, Clock, MapPin, Upload, Loader2, Check, X } from "lucide-react"

export function CompanySettingsSection() {
  const { settings, updateSettings } = useStore()
  
  const [companyName, setCompanyName] = useState(settings.company_name)
  const [companyPhone, setCompanyPhone] = useState(settings.company_phone)
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color || '#3b82f6')
  const [tagline, setTagline] = useState(settings.tagline || '')
  const [businessHours, setBusinessHours] = useState(settings.business_hours || '')
  const [serviceArea, setServiceArea] = useState(settings.service_area || '')
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [companySaving, setCompanySaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Sync with store when settings change
  useEffect(() => {
    setCompanyName(settings.company_name)
    setCompanyPhone(settings.company_phone)
    setPrimaryColor(settings.primary_color || '#3b82f6')
    setTagline(settings.tagline || '')
    setBusinessHours(settings.business_hours || '')
    setServiceArea(settings.service_area || '')
    setLogoUrl(settings.logo_url || '')
  }, [settings])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB')
      return
    }

    setLogoFile(file)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setLogoUrl(data.url)
        toast.success('Logo uploaded successfully')
      } else {
        toast.error('Failed to upload logo')
      }
    } catch (error) {
      console.error('Failed to upload logo:', error)
      toast.error('Failed to upload logo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveCompany = async () => {
    setCompanySaving(true)
    
    try {
      // Upload logo if selected
      let finalLogoUrl = logoUrl
      if (logoFile && !logoUrl) {
        const formData = new FormData()
        formData.append('file', logoFile)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (response.ok) {
          const data = await response.json()
          finalLogoUrl = data.url
        } else {
          toast.error('Failed to upload logo')
        }
      }
      
      await updateSettings({
        company_name: companyName,
        company_phone: companyPhone,
        primary_color: primaryColor,
        tagline: tagline,
        business_hours: businessHours,
        service_area: serviceArea,
        logo_url: finalLogoUrl,
      })
      
      toast.success('Company info saved')
      setIsEditingCompany(false)
    } catch (error) {
      console.error('Failed to save company settings:', error)
      toast.error('Failed to save company info')
    } finally {
      setCompanySaving(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset to store values
    setCompanyName(settings.company_name)
    setCompanyPhone(settings.company_phone)
    setPrimaryColor(settings.primary_color || '#3b82f6')
    setTagline(settings.tagline || '')
    setBusinessHours(settings.business_hours || '')
    setServiceArea(settings.service_area || '')
    setLogoUrl(settings.logo_url || '')
    setLogoFile(null)
    setIsEditingCompany(false)
  }

  const handleRemoveLogo = () => {
    setLogoUrl('')
    setLogoFile(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>
              Configure your company information and branding
            </CardDescription>
          </div>
          {!isEditingCompany && (
            <Button variant="outline" onClick={() => setIsEditingCompany(true)}>
              Edit Company
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {/* Logo Upload */}
          <Field>
            <FieldLabel>Company Logo</FieldLabel>
            {isEditingCompany ? (
              <div className="space-y-3">
                {logoUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={logoUrl}
                      alt="Company logo"
                      className="h-16 w-16 object-contain rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Choose logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    {isUploading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, PNG or JPG, max 2MB
                </p>
              </div>
            ) : (
              <div>
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="h-16 w-16 object-contain rounded-lg border"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    No logo
                  </div>
                )}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Name
            </FieldLabel>
            {isEditingCompany ? (
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                disabled={companySaving}
              />
            ) : (
              <div className="p-2 rounded-md bg-muted text-sm">
                {companyName || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Company Phone
            </FieldLabel>
            {isEditingCompany ? (
              <Input
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="Enter company phone"
                disabled={companySaving}
              />
            ) : (
              <div className="p-2 rounded-md bg-muted text-sm">
                {companyPhone || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Primary Color
            </FieldLabel>
            {isEditingCompany ? (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded cursor-pointer"
                  disabled={companySaving}
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                  disabled={companySaving}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded border"
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="text-sm">{primaryColor}</span>
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel>Tagline</FieldLabel>
            {isEditingCompany ? (
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Your company tagline"
                disabled={companySaving}
              />
            ) : (
              <div className="p-2 rounded-md bg-muted text-sm">
                {tagline || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Business Hours
            </FieldLabel>
            {isEditingCompany ? (
              <Textarea
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                placeholder="e.g., Mon-Fri: 8AM-6PM, Sat: 9AM-2PM"
                disabled={companySaving}
                rows={2}
              />
            ) : (
              <div className="p-2 rounded-md bg-muted text-sm whitespace-pre-wrap">
                {businessHours || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Service Area
            </FieldLabel>
            {isEditingCompany ? (
              <Textarea
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g., Greater Toronto Area, Hamilton, Oakville"
                disabled={companySaving}
                rows={2}
              />
            ) : (
              <div className="p-2 rounded-md bg-muted text-sm whitespace-pre-wrap">
                {serviceArea || <span className="text-muted-foreground">Not set</span>}
              </div>
            )}
          </Field>

          {isEditingCompany && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveCompany}
                disabled={companySaving}
                className="flex-1"
              >
                {companySaving ? (
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
                disabled={companySaving}
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
