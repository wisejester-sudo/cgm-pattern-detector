"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Plus, MoreVertical, Phone, Mail, User, KeyRound } from "lucide-react"
import { useStore } from "@/lib/store"
import { Spinner } from "@/components/ui/spinner"

export default function TechniciansPage() {
  const { technicians, jobs, addTechnician, updateTechnician, deleteTechnician } =
    useStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pin: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    addTechnician({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      pin: formData.pin,
      is_active: true,
    })

    setFormData({ name: "", email: "", phone: "", pin: "" })
    setIsLoading(false)
    setIsAddOpen(false)
  }

  const handleToggleActive = (techId: string, currentActive: boolean) => {
    updateTechnician(techId, { is_active: !currentActive })
  }

  const handleDelete = (techId: string) => {
    deleteTechnician(techId)
  }

  const getAssignedJobCount = (techId: string) => {
    return jobs.filter(
      (j) => j.assigned_tech_id === techId && j.status !== "complete"
    ).length
  }

  const isValid = formData.name && formData.email && formData.phone && formData.pin

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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Technician
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Technician</DialogTitle>
              <DialogDescription>
                Enter the technician details. The PIN will be used for mobile login.
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
                  <FieldLabel htmlFor="email">Email</FieldLabel>
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
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="pin">Login PIN (4 digits)</FieldLabel>
                  <Input
                    id="pin"
                    type="password"
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
                <Button type="submit" disabled={!isValid || isLoading}>
                  {isLoading && <Spinner className="mr-2" />}
                  Add Technician
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Technicians Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {technicians.map((tech) => {
          const assignedJobs = getAssignedJobCount(tech.id)
          return (
            <Card key={tech.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tech.name}</CardTitle>
                    <Badge
                      variant={tech.is_active ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {tech.is_active ? "Active" : "Inactive"}
                    </Badge>
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
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{tech.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{tech.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                  <span>PIN: ****</span>
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
    </div>
  )
}
