"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Trash2, Plus, Clock, Radio, Mail, Phone, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import {
  addProfile,
  updateProfile,
  deleteProfile,
  subscribeToProfiles,
  type Profile,
} from "@/lib/firestore/profiles"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function PresentersPage() {
  const [presenters, setPresenters] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPresenter, setEditingPresenter] = useState<Profile | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    email: "",
    phone: "",
    schedule: "",
    imageUrl: "",
    isActive: true,
  })

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    console.log("Setting up Firestore subscription for presenters...")
    const unsubscribe = subscribeToProfiles((updatedPresenters) => {
      console.log("Received presenters update:", updatedPresenters.length, "presenters")
      setPresenters(updatedPresenters)
      setLoading(false)
    })

    return () => {
      console.log("Cleaning up Firestore subscription...")
      unsubscribe()
    }
  }, [])

  // Auto-clear success/error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      email: "",
      phone: "",
      schedule: "",
      imageUrl: "",
      isActive: true,
    })
    setEditingPresenter(null)
    setError("")
    setSubmitting(false)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (submitting) return

    console.log("Form submitted:", formData)
    setSubmitting(true)
    setError("")

    try {
      if (editingPresenter) {
        console.log("Updating existing presenter...")
        await updateProfile(editingPresenter.id!, formData)
        setSuccess(`"${formData.name}" updated successfully!`)
      } else {
        console.log("Adding new presenter...")
        const newPresenterId = await addProfile(formData)
        console.log("New presenter created with ID:", newPresenterId)
        setSuccess(`"${formData.name}" added successfully!`)
      }

      console.log("Closing dialog and resetting form...")
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving presenter:", error)
      setError(error instanceof Error ? error.message : "Failed to save presenter. Please try again.")
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (presenter: Profile) => {
    console.log("Editing presenter:", presenter)
    setEditingPresenter(presenter)
    setFormData({
      name: presenter.name,
      bio: presenter.bio,
      email: presenter.email,
      phone: presenter.phone || "",
      schedule: presenter.schedule || "",
      imageUrl: presenter.imageUrl || "",
      isActive: presenter.isActive,
    })
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (presenterId: string, presenterName: string) => {
    if (!confirm(`Are you sure you want to delete "${presenterName}"?`)) return

    console.log("Deleting presenter:", presenterId)
    try {
      await deleteProfile(presenterId)
      setSuccess(`"${presenterName}" deleted successfully!`)
    } catch (error) {
      console.error("Error deleting presenter:", error)
      setError(error instanceof Error ? error.message : "Failed to delete presenter. Please try again.")
    }
  }

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open && !submitting) {
      console.log("Dialog closed by user")
      setIsDialogOpen(false)
      resetForm()
    }
  }

  // Handle opening new presenter dialog
  const handleOpenNewPresenter = () => {
    console.log("Opening new presenter dialog")
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col">
        <DashboardHeader title="Presenters" />

        <div className="flex-1 p-6 bg-radio-gray">
          <div className="max-w-7xl mx-auto">
            {/* Success/Error Messages */}
            {success && (
              <Alert className="mb-6 border-green-500/50 bg-green-500/10 animate-in slide-in-from-top-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500 font-medium">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-radio-red/50 bg-radio-red/10 animate-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 text-radio-red" />
                <AlertDescription className="text-radio-red font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {/* Presenters count and add button */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-white">
                <h2 className="text-lg font-semibold">
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading presenters...
                    </div>
                  ) : (
                    `${presenters.length} Presenter${presenters.length !== 1 ? "s" : ""} Total`
                  )}
                </h2>
                {!loading && (
                  <p className="text-white/70 text-sm">
                    {presenters.filter((p) => p.isActive).length} active, {presenters.filter((p) => !p.isActive).length}{" "}
                    inactive
                  </p>
                )}
              </div>
              <Button
                onClick={handleOpenNewPresenter}
                className="bg-radio-gold text-radio-black hover:bg-radio-gold/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Presenter
              </Button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-radio-gold" />
                <div className="text-white/70">
                  <p className="text-lg">Connecting to Firebase...</p>
                  <p className="text-sm">Loading presenters from database</p>
                </div>
              </div>
            ) : presenters.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-white/70 mb-4">
                  <div className="h-12 w-12 mx-auto mb-4 text-radio-gold" />
                  <h3 className="text-xl font-semibold mb-2">No presenters yet</h3>
                  <p>Get started by adding your first presenter profile</p>
                </div>
              </div>
            ) : (
              /* Presenters Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {presenters.map((presenter) => (
                  <Card
                    key={presenter.id}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          {presenter.imageUrl ? (
                            <AvatarImage src={presenter.imageUrl} alt={presenter.name} />
                          ) : null}
                          <AvatarFallback className="bg-radio-gold text-radio-black font-semibold">
                            {presenter.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{presenter.name}</CardTitle>
                          <div className="flex items-center mt-1">
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${presenter.isActive ? "bg-green-500" : "bg-red-500"}`}
                            />
                            <span className="text-sm text-white/70">{presenter.isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-white/80 line-clamp-3">{presenter.bio}</p>

                        <div className="space-y-2">
                          {presenter.email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="h-4 w-4 text-radio-gold" />
                              <span>{presenter.email}</span>
                            </div>
                          )}
                          {presenter.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-4 w-4 text-radio-gold" />
                              <span>{presenter.phone}</span>
                            </div>
                          )}
                          {presenter.schedule && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="h-4 w-4 text-radio-gold" />
                              <span>{presenter.schedule}</span>
                            </div>
                          )}
                          {presenter.shows && presenter.shows.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Radio className="h-4 w-4 text-radio-gold" />
                              <span>{presenter.shows.join(", ")}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(presenter)}
                            className="border-radio-gold text-radio-gold hover:bg-radio-gold hover:text-radio-black bg-transparent"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(presenter.id!, presenter.name)}
                            className="border-radio-red text-radio-red hover:bg-radio-red hover:text-white bg-transparent"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Presenter Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="bg-radio-black border-radio-gold text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPresenter ? "Edit Presenter" : "Add New Presenter"}</DialogTitle>
              <DialogDescription className="text-white/70">
                {editingPresenter ? "Update presenter information" : "Create a new presenter profile"}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert className="border-radio-red/50 bg-radio-red/10">
                <AlertCircle className="h-4 w-4 text-radio-red" />
                <AlertDescription className="text-radio-red">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter presenter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  placeholder="Enter presenter bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="presenter@zibonele.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+27 123 456 789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  placeholder="e.g., Mon-Fri 06:00-09:00"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Profile Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  disabled={submitting}
                />
                <Label htmlFor="isActive">Presenter is active</Label>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-radio-gold text-radio-black hover:bg-radio-gold/90"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {editingPresenter ? "Updating..." : "Adding..."}
                    </div>
                  ) : editingPresenter ? (
                    "Update Presenter"
                  ) : (
                    "Add Presenter"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <FloatingActionButton onClick={handleOpenNewPresenter} />
      </div>
    </DashboardLayout>
  )
}
