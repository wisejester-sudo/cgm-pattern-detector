"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, User, Wrench, Bot } from "lucide-react"
import { formatDistanceToNow, formatDate } from "@/lib/date-utils"
import { useStore } from "@/lib/store"
import type { JobNote } from "@/lib/types"
import { cn } from "@/lib/utils"

interface JobNotesProps {
  jobId: string
}

export function JobNotes({ jobId }: JobNotesProps) {
  const [notes, setNotes] = useState<JobNote[]>([])
  const [newNote, setNewNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { currentAdmin, currentTechId } = useStore()

  useEffect(() => {
    loadNotes()
  }, [jobId])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/notes`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSubmitting(true)
    try {
      const isAdmin = !!currentAdmin
      const createdByName = isAdmin 
        ? currentAdmin?.name || "Admin"
        : "Technician"
      
      const response = await fetch(`/api/jobs/${jobId}/notes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await getSessionToken()}`
        },
        body: JSON.stringify({
          content: newNote.trim(),
          created_by_name: createdByName,
          created_by_type: isAdmin ? "admin" : "technician",
        }),
      })

      if (response.ok) {
        setNewNote("")
        loadNotes()
        toast.success("Note added")
      } else {
        toast.error("Failed to add note")
      }
    } catch (error) {
      toast.error("Failed to add note")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/notes?noteId=${noteId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${await getSessionToken()}`
        }
      })

      if (response.ok) {
        loadNotes()
        toast.success("Note deleted")
      } else {
        toast.error("Failed to delete note")
      }
    } catch (error) {
      toast.error("Failed to delete note")
    }
  }

  const getSessionToken = async () => {
    // This is a placeholder - in real implementation you'd get from Supabase
    return ""
  }

  const getAuthorIcon = (type: string) => {
    switch (type) {
      case "admin":
        return <User className="h-4 w-4" />
      case "technician":
        return <Wrench className="h-4 w-4" />
      case "system":
        return <Bot className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getAuthorColor = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-blue-100 text-blue-700"
      case "technician":
        return "bg-green-100 text-green-700"
      case "system":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Notes
          {notes.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({notes.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Add Note
          </Button>
        </div>

        {/* Notes List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet. Add a note to track important information.
          </p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex gap-3 p-3 rounded-lg bg-muted/50 group"
              >
                <Avatar className={cn("h-8 w-8", getAuthorColor(note.created_by_type))}>
                  <AvatarFallback className="text-xs">
                    {getAuthorIcon(note.created_by_type)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {note.created_by_name}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        ({note.created_by_type})
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span
                        className="text-xs text-muted-foreground"
                        title={formatDate(note.created_at)}
                      >
                        {formatDistanceToNow(note.created_at)}
                      </span>
                    </div>
                    
                    {/* Delete button - only show for own notes or admins */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>

                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
