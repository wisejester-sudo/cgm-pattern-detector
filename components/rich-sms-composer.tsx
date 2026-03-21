"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Image, MapPin, Paperclip, X, Send } from "lucide-react"
import { toast } from "sonner"

interface RichSmsComposerProps {
  jobId: string
  customerPhone: string
  onSend: (message: string, attachments?: Attachment[]) => void
}

type Attachment = {
  type: "image" | "audio" | "location" | "file"
  url: string
  name?: string
}

export function RichSmsComposer({
  jobId,
  customerPhone,
  onSend,
}: RichSmsComposerProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return

    onSend(message, attachments)
    setMessage("")
    setAttachments([])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      // In real implementation, upload to storage and get URL
      const mockUrl = URL.createObjectURL(file)
      setAttachments((prev) => [
        ...prev,
        {
          type: file.type.startsWith("image/") ? "image" : "file",
          url: mockUrl,
          name: file.name,
        },
      ])
    })

    toast.success(`${files.length} file(s) attached`)
  }

  const handleVoiceRecord = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true)
      toast.info("Recording started...")
    } else {
      // Stop recording
      setIsRecording(false)
      toast.success("Voice memo attached")
      setAttachments((prev) => [
        ...prev,
        { type: "audio", url: "#", name: "Voice memo" },
      ])
    }
  }

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        setAttachments((prev) => [
          ...prev,
          {
            type: "location",
            url: `https://maps.google.com/?q=${latitude},${longitude}`,
            name: "Current location",
          },
        ])
        toast.success("Location attached")
      })
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Send Rich Message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message Input */}
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
              >
                {attachment.type === "image" && (
                  <Image className="h-4 w-4" />
                )}
                {attachment.type === "audio" && <Mic className="h-4 w-4" />}
                {attachment.type === "location" && (
                  <MapPin className="h-4 w-4" />
                )}
                {attachment.type === "file" && <Paperclip className="h-4 w-4" />}
                <span className="text-sm truncate max-w-[150px]">
                  {attachment.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              multiple
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceRecord}
              className={isRecording ? "text-red-500 animate-pulse" : ""}
              title="Voice memo"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLocationShare}
              title="Share location"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Note: Rich media will be sent as links via SMS. Customers can tap to
          view.
        </p>
      </CardContent>
    </Card>
  )
}
