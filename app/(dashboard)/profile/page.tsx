"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Camera,
  Check,
  Clock,
  MessageSquare,
  Users,
  Briefcase,
  Download,
  ExternalLink,
} from "lucide-react"
import { useStore } from "@/lib/store"

export default function ProfilePage() {
  const {
    currentAdmin,
    settings,
    subscription,
    invoices,
    notificationPreferences,
    updateAdmin,
    updateSettings,
    updateNotificationPreferences,
  } = useStore()

  // Profile state
  const [profileName, setProfileName] = useState(currentAdmin?.name || "")
  const [profileEmail, setProfileEmail] = useState(currentAdmin?.email || "")
  const [profilePhone, setProfilePhone] = useState(currentAdmin?.phone || "")
  const [profileSaved, setProfileSaved] = useState(false)

  // Branding state
  const [companyName, setCompanyName] = useState(settings.company_name)
  const [companyPhone, setCompanyPhone] = useState(settings.company_phone)
  const [tagline, setTagline] = useState(settings.tagline || "")
  const [businessHours, setBusinessHours] = useState(settings.business_hours || "")
  const [serviceArea, setServiceArea] = useState(settings.service_area || "")
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color || "#3b82f6")
  const [brandingSaved, setBrandingSaved] = useState(false)

  // Notification state
  const [notifications, setNotifications] = useState(notificationPreferences)
  const [notificationsSaved, setNotificationsSaved] = useState(false)

  const handleSaveProfile = () => {
    updateAdmin({
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
    })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  const handleSaveBranding = () => {
    updateSettings({
      company_name: companyName,
      company_phone: companyPhone,
      tagline,
      business_hours: businessHours,
      service_area: serviceArea,
      primary_color: primaryColor,
    })
    setBrandingSaved(true)
    setTimeout(() => setBrandingSaved(false), 2000)
  }

  const handleSaveNotifications = () => {
    updateNotificationPreferences(notifications)
    setNotificationsSaved(true)
    setTimeout(() => setNotificationsSaved(false), 2000)
  }

  const smsUsagePercent = (subscription.sms_used_this_month / subscription.sms_limit) * 100
  const nextBillingDate = new Date(subscription.current_period_end)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!currentAdmin) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, company branding, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentAdmin.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(currentAdmin.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="profileName">Full Name</FieldLabel>
                    <Input
                      id="profileName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profileEmail">Email Address</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        id="profileEmail"
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Badge variant="secondary" className="shrink-0">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="profilePhone">Phone Number</FieldLabel>
                  <Input
                    id="profilePhone"
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="max-w-xs"
                  />
                </Field>
              </FieldGroup>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Last login: {currentAdmin.last_login
                    ? new Date(currentAdmin.last_login).toLocaleString()
                    : "Never"}
                </div>
                <Button onClick={handleSaveProfile}>
                  {profileSaved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className="max-w-sm"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmNewPassword">Confirm New Password</FieldLabel>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </Field>
                </div>
                <Button variant="outline">Update Password</Button>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Branding</CardTitle>
              <CardDescription>
                Customize how your business appears to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Displayed on customer tracking pages and SMS
                  </p>
                </div>
              </div>

              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="companyPhone">Company Phone</FieldLabel>
                    <Input
                      id="companyPhone"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                    />
                  </Field>
                </div>
                
                <Field>
                  <FieldLabel htmlFor="tagline">Tagline / Slogan</FieldLabel>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g., Keeping You Cool Since 2010"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="businessHours">Business Hours</FieldLabel>
                    <Input
                      id="businessHours"
                      value={businessHours}
                      onChange={(e) => setBusinessHours(e.target.value)}
                      placeholder="e.g., Mon-Fri 8AM-6PM"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="serviceArea">Service Area</FieldLabel>
                    <Input
                      id="serviceArea"
                      value={serviceArea}
                      onChange={(e) => setServiceArea(e.target.value)}
                      placeholder="e.g., Austin Metro Area"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="primaryColor">Brand Color</FieldLabel>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 rounded-md border border-input cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="max-w-32 font-mono"
                    />
                    <span className="text-sm text-muted-foreground">
                      Used on customer tracking page
                    </span>
                  </div>
                </Field>
              </FieldGroup>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveBranding}>
                  {brandingSaved ? "Saved!" : "Save Branding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {subscription.plan === "pro" ? "Pro" : "Starter"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">SMS Usage</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {subscription.sms_used_this_month}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{subscription.sms_limit}
                    </span>
                  </p>
                  <Progress value={smsUsagePercent} className="mt-2 h-2" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Technicians</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {subscription.plan === "pro" ? "Unlimited" : "3 max"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm">Jobs</span>
                  </div>
                  <p className="text-2xl font-bold">Unlimited</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">
                    ${subscription.plan === "pro" ? "79" : "39"}/month
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Next billing date: {nextBillingDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {subscription.plan === "starter" && (
                    <Button>Upgrade to Pro</Button>
                  )}
                  <Button variant="outline">Manage Plan</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Update your payment information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download past invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={invoice.status === "paid" ? "secondary" : "destructive"}
                      >
                        {invoice.status}
                      </Badge>
                      <span className="font-medium">${invoice.amount}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose which email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">New job assigned to technician</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a job is assigned to any technician
                  </p>
                </div>
                <Switch
                  checked={notifications.email_new_job}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_new_job: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="font-medium">Status updates from technicians</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when technicians update job status
                  </p>
                </div>
                <Switch
                  checked={notifications.email_status_updates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_status_updates: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="font-medium">Customer replies</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when customers respond to SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.email_customer_replies}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_customer_replies: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="font-medium">Daily summary report</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of all job activity
                  </p>
                </div>
                <Switch
                  checked={notifications.email_daily_summary}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email_daily_summary: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMS Notifications</CardTitle>
              <CardDescription>
                Receive text message alerts for urgent updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Enable SMS alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Receive urgent notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.sms_enabled}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sms_enabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>
                Set times when you don&apos;t want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Field>
                  <FieldLabel htmlFor="quietStart">Start</FieldLabel>
                  <Input
                    id="quietStart"
                    type="time"
                    value={notifications.quiet_hours_start || ""}
                    onChange={(e) =>
                      setNotifications({ ...notifications, quiet_hours_start: e.target.value })
                    }
                    className="w-32"
                  />
                </Field>
                <span className="text-muted-foreground mt-6">to</span>
                <Field>
                  <FieldLabel htmlFor="quietEnd">End</FieldLabel>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={notifications.quiet_hours_end || ""}
                    onChange={(e) =>
                      setNotifications({ ...notifications, quiet_hours_end: e.target.value })
                    }
                    className="w-32"
                  />
                </Field>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Notifications will be silenced during these hours
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications}>
              {notificationsSaved ? "Saved!" : "Save Notification Preferences"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
