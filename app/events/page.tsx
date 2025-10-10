"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, MapPin, Edit, Trash2, Clock, Plus, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { addEvent, updateEvent, deleteEvent, subscribeToEvents, type Event } from "@/lib/firestore/events"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    imageUrl: "",
    isPublished: false,
  })

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    console.log("Setting up Firestore subscription for events...")
    const unsubscribe = subscribeToEvents((updatedEvents) => {
      console.log("Received events update:", updatedEvents.length, "events")
      setEvents(updatedEvents)
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
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      imageUrl: "",
      isPublished: false,
    })
    setEditingEvent(null)
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
      if (editingEvent) {
        console.log("Updating existing event...")
        await updateEvent(editingEvent.id!, formData)
        setSuccess(`"${formData.title}" updated successfully!`)
      } else {
        console.log("Adding new event...")
        const newEventId = await addEvent(formData)
        console.log("New event created with ID:", newEventId)
        setSuccess(`"${formData.title}" added successfully!`)
      }

      console.log("Closing dialog and resetting form...")
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving event:", error)
      setError(error instanceof Error ? error.message : "Failed to save event. Please try again.")
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (event: Event) => {
    console.log("Editing event:", event)
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl || "",
      isPublished: event.isPublished,
    })
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"?`)) return

    console.log("Deleting event:", eventId)
    try {
      await deleteEvent(eventId)
      setSuccess(`"${eventTitle}" deleted successfully!`)
    } catch (error) {
      console.error("Error deleting event:", error)
      setError(error instanceof Error ? error.message : "Failed to delete event. Please try again.")
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

  // Handle opening new event dialog
  const handleOpenNewEvent = () => {
    console.log("Opening new event dialog")
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col">
        <DashboardHeader title="Events" />

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

            {/* Events count and add button */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-white">
                <h2 className="text-lg font-semibold">
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading events...
                    </div>
                  ) : (
                    `${events.length} Event${events.length !== 1 ? "s" : ""} Total`
                  )}
                </h2>
                {!loading && (
                  <p className="text-white/70 text-sm">
                    {events.filter((e) => e.isPublished).length} published,{" "}
                    {events.filter((e) => !e.isPublished).length} draft
                  </p>
                )}
              </div>
              <Button onClick={handleOpenNewEvent} className="bg-radio-gold text-radio-black hover:bg-radio-gold/90">
                <Plus className="h-4 w-4 mr-2" />
                Add New Event
              </Button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-radio-gold" />
                <div className="text-white/70">
                  <p className="text-lg">Connecting to Firebase...</p>
                  <p className="text-sm">Loading events from database</p>
                </div>
              </div>
            ) : events.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-white/70 mb-4">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-radio-gold" />
                  <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                  <p>Get started by creating your first event</p>
                </div>
              </div>
            ) : (
              /* Events Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="text-white/70 mt-1">{event.description}</CardDescription>
                        </div>
                        <Badge
                          variant={event.isPublished ? "default" : "secondary"}
                          className={event.isPublished ? "bg-radio-gold text-radio-black" : "bg-radio-gray text-white"}
                        >
                          {event.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-radio-gold" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-radio-gold" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-radio-gold" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(event)}
                            className="border-radio-gold text-radio-gold hover:bg-radio-gold hover:text-radio-black bg-transparent"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(event.id!, event.title)}
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

        {/* Add/Edit Event Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="bg-radio-black border-radio-gold text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
              <DialogDescription className="text-white/70">
                {editingEvent ? "Update event information" : "Create a new event for your community"}
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
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="eventDescription">Description *</Label>
                <Textarea
                  id="eventDescription"
                  placeholder="Enter event description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="eventTime">Time *</Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eventLocation">Location *</Label>
                <Input
                  id="eventLocation"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="eventImageUrl">Event Image URL</Label>
                <Input
                  id="eventImageUrl"
                  placeholder="https://example.com/event-image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  disabled={submitting}
                />
                <Label htmlFor="isPublished">Publish event</Label>
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
                      {editingEvent ? "Updating..." : "Creating..."}
                    </div>
                  ) : editingEvent ? (
                    "Update Event"
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <FloatingActionButton onClick={handleOpenNewEvent} />
      </div>
    </DashboardLayout>
  )
}
