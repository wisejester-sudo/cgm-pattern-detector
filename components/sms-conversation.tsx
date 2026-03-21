"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, ChevronDown, Smile, Paperclip, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { SmsLog } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SmsConversationProps {
  jobId: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  jobType?: string
  scheduledTime?: string
  companyName?: string
  companyPhone?: string
  assignedTechs?: string[]
  messages: SmsLog[]
  currentUserName: string
  currentUserType: 'admin' | 'technician'
  onSendMessage: (message: string) => void
  templates?: Array<{ name: string; template_body: string }>
}

export function SmsConversation({
  jobId,
  customerName,
  customerPhone,
  customerAddress = '',
  jobType = '',
  scheduledTime = '',
  companyName = '',
  companyPhone = '',
  assignedTechs = [],
  messages,
  currentUserName,
  currentUserType,
  onSendMessage,
  templates = [],
}: SmsConversationProps) {
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Populate template placeholders with actual data
  const populateTemplate = (template: string): string => {
    const techName = assignedTechs[0] || 'Technician'
    const eta = '30 minutes' // Could calculate from scheduled time
    const formattedTime = scheduledTime 
      ? new Date(scheduledTime).toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit' 
        })
      : 'soon'
    
    return template
      .replace(/\{customer_name\}/g, customerName)
      .replace(/\{customer_phone\}/g, customerPhone)
      .replace(/\{address\}/g, customerAddress)
      .replace(/\{job_type\}/g, jobType)
      .replace(/\{scheduled_time\}/g, formattedTime)
      .replace(/\{company_name\}/g, companyName)
      .replace(/\{company_phone\}/g, companyPhone)
      .replace(/\{tech_name\}/g, techName)
      .replace(/\{eta\}/g, eta)
  }

  const insertTemplate = (templateBody: string) => {
    const populatedTemplate = populateTemplate(templateBody)
    setNewMessage((prev) => {
      const separator = prev && !prev.endsWith(" ") ? " " : ""
      return prev + separator + populatedTemplate
    })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.sent_at).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, SmsLog[]>)

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {customerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{customerName}</CardTitle>
              <p className="text-xs text-muted-foreground">{customerPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            {messages.length} messages
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Thread */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="space-y-4">
                {/* Date Divider */}
                <div className="flex items-center justify-center">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {date === new Date().toLocaleDateString() ? "Today" : date}
                  </span>
                </div>

                {/* Messages for this date */}
                {dateMessages.map((message, index) => {
                  const isOutbound = message.direction === "outbound"
                  const showSender =
                    index === 0 ||
                    dateMessages[index - 1].sender_name !== message.sender_name

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        isOutbound ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      {showSender && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback
                            className={cn(
                              "text-xs",
                              isOutbound
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 text-gray-700"
                            )}
                          >
                            {isOutbound
                              ? message.sender_name?.charAt(0).toUpperCase() ||
                                "Y"
                              : customerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!showSender && <div className="w-8" />}

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "max-w-[70%] space-y-1",
                          isOutbound ? "items-end" : "items-start"
                        )}
                      >
                        {/* Sender Name */}
                        {showSender && (
                          <p className="text-xs text-muted-foreground px-1">
                            {isOutbound
                              ? message.sender_name || "You"
                              : customerName}
                            {message.sender_type && isOutbound && (
                              <span className="ml-1 opacity-70">
                                ({message.sender_type})
                              </span>
                            )}
                          </p>
                        )}

                        {/* Message Content */}
                        <div
                          className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm",
                            isOutbound
                              ? "bg-blue-500 text-white rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          <p className="whitespace-pre-wrap">
                            {message.message_body}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <p className="text-[10px] text-muted-foreground px-1">
                          {formatDistanceToNow(new Date(message.sent_at), {
                            addSuffix: true,
                          })}
                          {message.status === "failed" && (
                            <span className="text-red-500 ml-1">• Failed</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          {/* Template Selector */}
          {templates.length > 0 && (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    Insert Template
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {templates.map((template) => (
                    <DropdownMenuItem
                      key={template.name}
                      onClick={() => insertTemplate(template.template_body)}
                      className="text-xs cursor-pointer"
                    >
                      <span className="truncate">{template.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Message Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder={`Message ${customerName}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <Smile className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <Button onClick={handleSend} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Messages will be sent from {currentUserName} ({currentUserType})
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
