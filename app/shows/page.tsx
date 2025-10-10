"use client"

import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Trash2, Clock, User, Plus, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { addShow, updateShow, deleteShow, getShows, type Show } from "@/lib/firestore/shows"

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    presenter: "",
    timeSlot: "",
    day: "",
    genre: "",
    isActive: true,
  })

  // Fetch shows on component mount
  useEffect(() => {
    const fetchShows = async () => {
      try {
        console.log("Fetching shows...")
        const showsData = await getShows()
        console.log("Fetched shows:", showsData.length, "shows")
        setShows(showsData)
      } catch (error) {
        console.error("Error fetching shows:", error)
        setError("Failed to load shows. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchShows()
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
      presenter: "",
      timeSlot: "",
      day: "",
      genre: "",
      isActive: true,
    })
    setEditingShow(null)
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
      if (editingShow) {
        console.log("Updating existing show...")
        await updateShow(editingShow.id!, formData)
        setSuccess(`"${formData.title}" updated successfully!`)
      } else {
        console.log("Adding new show...")
        const newShowId = await addShow(formData)
        console.log("New show created with ID:", newShowId)
        setSuccess(`"${formData.title}" added successfully!`)
      }

      console.log("Closing dialog and resetting form...")
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving show:", error)
      setError(error instanceof Error ? error.message : "Failed to save show. Please try again.")
      setSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (show: Show) => {
    console.log("Editing show:", show)
    setEditingShow(show)
    setFormData({
      title: show.title,
      description: show.description,
      presenter: show.presenter,
      timeSlot: show.timeSlot,
      day: show.day,
      genre: show.genre,
      isActive: show.isActive,
    })
    setIsDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (showId: string, showTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${showTitle}"?`)) return

    console.log("Deleting show:", showId)
    try {
      await deleteShow(showId)
      setSuccess(`"${showTitle}" deleted successfully!`)
    } catch (error) {
      console.error("Error deleting show:", error)
      setError(error instanceof Error ? error.message : "Failed to delete show. Please try again.")
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

  // Handle opening new show dialog
  const handleOpenNewShow = () => {
    console.log("Opening new show dialog")
    resetForm()
    setIsDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col">
        <DashboardHeader title="Shows Line Up" />

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

            {/* Shows count and add button */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-white">
                <h2 className="text-lg font-semibold">
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading shows...
                    </div>
                  ) : (
                    `${shows.length} Show${shows.length !== 1 ? "s" : ""} Total`
                  )}
                </h2>
                {!loading && (
                  <p className="text-white/70 text-sm">
                    {shows.filter((show) => show.isActive).length} active,{" "}
                    {shows.filter((show) => !show.isActive).length} inactive
                  </p>
                )}
              </div>
              <Button onClick={handleOpenNewShow} className="bg-radio-gold text-radio-black hover:bg-radio-gold/90">
                <Plus className="h-4 w-4 mr-2" />
                Add New Show
              </Button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-radio-gold" />
                <div className="text-white/70">
                  <p className="text-lg">Loading shows...</p>
                  <p className="text-sm">Please wait while we fetch your schedule</p>
                </div>
              </div>
            ) : shows.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-white/70 mb-4">
                  <Plus className="h-12 w-12 mx-auto mb-4 text-radio-gold" />
                  <h3 className="text-xl font-semibold mb-2">No shows yet</h3>
                  <p>Get started by adding your first radio show</p>
                </div>
              </div>
            ) : (
              /* Shows Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shows.map((show) => (
                  <Card
                    key={show.id}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{show.title}</CardTitle>
                          <CardDescription className="text-white/70 mt-1">{show.description}</CardDescription>
                        </div>
                        <Badge
                          variant={show.isActive ? "default" : "secondary"}
                          className={show.isActive ? "bg-radio-gold text-radio-black" : "bg-radio-gray text-white"}
                        >
                          {show.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="h-4 w-4 text-radio-gold" />
                          <span>{show.presenter}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-radio-gold" />
                          <span>{show.timeSlot}</span>
                        </div>
                        <div className="text-sm text-white/70">
                          {show.day} • {show.genre}
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(show)}
                            className="border-radio-gold text-radio-gold hover:bg-radio-gold hover:text-radio-black bg-transparent"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(show.id!, show.title)}
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

        {/* Add/Edit Show Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="bg-radio-black border-radio-gold text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingShow ? "Edit Show" : "Add New Show"}</DialogTitle>
              <DialogDescription className="text-white/70">
                {editingShow ? "Update the show information" : "Create a new radio show for your lineup"}
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
                <Label htmlFor="title">Show Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter show title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter show description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="presenter">Presenter *</Label>
                <Input
                  id="presenter"
                  placeholder="Enter presenter name"
                  value={formData.presenter}
                  onChange={(e) => setFormData({ ...formData, presenter: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeSlot">Time Slot *</Label>
                  <Input
                    id="timeSlot"
                    placeholder="e.g., 06:00 - 09:00"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="day">Day(s) *</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(value) => setFormData({ ...formData, day: value })}
                    required
                    disabled={submitting}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday - Friday">Monday - Friday</SelectItem>
                      <SelectItem value="Weekend">Weekend</SelectItem>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="genre">Genre *</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => setFormData({ ...formData, genre: value })}
                  required
                  disabled={submitting}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pop/Rock">Pop/Rock</SelectItem>
                    <SelectItem value="Jazz">Jazz</SelectItem>
                    <SelectItem value="Blues">Blues</SelectItem>
                    <SelectItem value="Classical">Classical</SelectItem>
                    <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                    <SelectItem value="Electronic">Electronic</SelectItem>
                    <SelectItem value="Country">Country</SelectItem>
                    <SelectItem value="R&B">R&B</SelectItem>
                    <SelectItem value="Talk">Talk</SelectItem>
                    <SelectItem value="News">News</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  disabled={submitting}
                />
                <Label htmlFor="isActive">Show is active</Label>
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
                      {editingShow ? "Updating..." : "Adding..."}
                    </div>
                  ) : editingShow ? (
                    "Update Show"
                  ) : (
                    "Add Show"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <FloatingActionButton onClick={handleOpenNewShow} />
      </div>
    </DashboardLayout>
  )
}
