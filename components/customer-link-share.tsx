"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Link2, Copy, CheckCircle, Send, Loader2, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface CustomerLinkShareProps {
  jobId: string
  customerPhone?: string
  customerName?: string
}

export function CustomerLinkShare({ jobId, customerPhone, customerName }: CustomerLinkShareProps) {
  const [linkUrl, setLinkUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)

  // Fetch existing link on mount
  useEffect(() => {
    fetchExistingLink()
  }, [jobId])

  const fetchExistingLink = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/jobs/${jobId}/customer-link`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          setLinkUrl(data.url)
          setExpiresAt(data.expires_at)
        }
      }
    } catch (error) {
      console.error("Error fetching link:", error)
    }
  }

  const generateLink = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/jobs/${jobId}/customer-link`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate link")
      }
      
      const data = await response.json()
      setLinkUrl(data.url)
      setExpiresAt(data.expires_at)
      toast.success("Customer link generated")
    } catch (error) {
      toast.error("Failed to generate link")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!linkUrl) return
    
    try {
      await navigator.clipboard.writeText(linkUrl)
      setCopied(true)
      toast.success("Link copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const sendSms = async () => {
    if (!linkUrl || !customerPhone) {
      toast.error("Customer phone number not available")
      return
    }

    setSending(true)
    try {
      const response = await fetch(`/api/sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          recipient_phone: customerPhone,
          message_body: `Hi ${customerName || 'there'}, you can track your job status here: ${linkUrl}`,
          sender_name: "Dispatchly",
          sender_type: "system",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send SMS")
      }

      toast.success("Link sent via SMS")
    } catch (error) {
      toast.error("Failed to send SMS")
    } finally {
      setSending(false)
    }
  }

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="h-4 w-4 mr-1" />
          Customer Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Job with Customer</DialogTitle>
          <DialogDescription>
            Generate a link for your customer to track their job status and view photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!linkUrl ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Generate a secure link that your customer can use to track their job.
              </p>
              <Button onClick={generateLink} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Link</label>
                <div className="flex gap-2">
                  <Input
                    value={linkUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Link expires: {expiresAt ? formatExpiry(expiresAt) : '30 days'}
                </p>
              </div>

              {customerPhone && (
                <Button
                  onClick={sendSms}
                  disabled={sending}
                  className="w-full"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send via SMS to {customerPhone}
                    </>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={generateLink}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Link
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>What customers can see:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Job status and progress</li>
              <li>Scheduled time and address</li>
              <li>Assigned technician info</li>
              <li>Job photos</li>
            </ul>
            <p className="mt-2">What customers cannot see:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Internal notes</li>
              <li>Other customer information</li>
              <li>Edit or modify anything</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
