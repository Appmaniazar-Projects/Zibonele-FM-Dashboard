"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addShow, deleteShow, getShows, subscribeToShows, updateShow, type GroupedShow, type Show } from "@/lib/firestore/shows"
import { AlertCircle, CheckCircle, Clock, Edit, Loader2, Plus, Trash2, User } from "lucide-react"
import { useEffect, useState } from "react"

type FormState = {
  title: string
  presenter: string
  description: string
  isActive: boolean
  startTime: string
  endTime: string
  days: string[]
}

const DAY_OPTIONS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
const DAY_LABEL: Record<string, string> = {
  mon: "MON",
  tue: "TUE",
  wed: "WED",
  thu: "THU",
  fri: "FRI",
  sat: "SAT",
  sun: "SUN",
}

// Helper to convert full day names to short (monday -> mon)
const toShortDayName = (day: string): string => {
  const dayMap: Record<string, string> = {
    monday: "mon",
    tuesday: "tue",
    wednesday: "wed",
    thursday: "thu",
    friday: "fri",
    saturday: "sat",
    sunday: "sun",
  }
  return dayMap[day.toLowerCase()] || day.toLowerCase()
}

// Helper to convert short day names to full (mon -> monday)
const toFullDayName = (day: string): string => {
  const dayMap: Record<string, string> = {
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
    sat: "saturday",
    sun: "sunday",
  }
  return dayMap[day.toLowerCase()] || day.toLowerCase()
}

export default function ShowsPage() {
  const [shows, setShows] = useState<GroupedShow[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShow, setEditingShow] = useState<GroupedShow | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState<FormState>({
    title: "",
    presenter: "",
    description: "",
    isActive: true,
    startTime: "",
    endTime: "",
    days: [],
  })

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    console.log("Setting up Firebase subscription for shows...")
    const unsubscribe = subscribeToShows((updatedShows) => {
      console.log("Received shows update:", updatedShows.length, "shows")
      setShows(updatedShows)
      setLoading(false)
    })

    return () => {
      console.log("Cleaning up Firebase subscription...")
      unsubscribe()
    }
  }, [])

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

  const refreshShows = async () => {
    try {
      setLoading(true)
      const data = await getShows()
      setShows(data)
      setLoading(false)
    } catch (err) {
      console.error("Error refreshing shows:", err)
      setError("Failed to load shows. Please try again.")
      setLoading(false)
    }
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      if (prev.days.includes(day)) {
        return { ...prev, days: prev.days.filter((d) => d !== day) }
      }
      return { ...prev, days: [...prev.days, day] }
    })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      presenter: "",
      description: "",
      isActive: true,
      startTime: "",
      endTime: "",
      days: [],
    });
    setEditingShow(null);
  }

  const formatForStorage = (time: string) => {
    const [hours, minutes] = time.split(':');
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = (minutes || '00').padStart(2, '0');
    return `${formattedHours}h${formattedMinutes}`;
  }
  
  const generateShowKey = (title: string, time: string) => `${title.toLowerCase()}-${time}`

  const handleSubmit = async () => {
    if (submitting) return;

    if (!formData.startTime || !formData.endTime || formData.days.length === 0) {
      setError("Please provide start/end time and select at least one day.");
      return;
    }

    const formattedStart = formatForStorage(formData.startTime);
    const formattedEnd = formatForStorage(formData.endTime);
    const timeString = `${formattedStart} - ${formattedEnd}`;

    const showData: Omit<Show, "id" | "createdAt" | "updatedAt"> = {
      title: formData.title.trim(),
      description: formData.presenter.trim(),
      presenter: "",
      isActive: formData.isActive,
      time: timeString,
      day: (formData.days[0] || "mon") as Show["day"],
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingShow) {
        const oldShowKey = generateShowKey(editingShow.title, editingShow.time);
        await updateShow(oldShowKey, showData, formData.days, editingShow.showIds);
        setSuccess("Show updated successfully.");
        // Real-time listener will automatically update the UI
      } else {
        const existingShow = shows.find(
          (s) =>
            s.title.toLowerCase() === showData.title.toLowerCase() &&
            s.time === timeString
        );

        if (existingShow) {
          setError("A show with this title and time already exists.");
          return;
        }

        await addShow(formData.days, showData);
        setSuccess("Show added successfully.");
        // Real-time listener will automatically update the UI
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error saving show:", err);
      setError("Failed to save show. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleEdit = (show: GroupedShow) => {
    setEditingShow(show);
    
    let startTime = "";
    let endTime = "";

    if (show.time) {
      const timeParts = show.time.split(" - ");
      if (timeParts.length === 2) {
        const parseTime = (timeStr: string) => {
          const cleanTime = timeStr.trim().toLowerCase();
          const normalized = cleanTime.replace('h', ':');
          const [hours, minutes = '00'] = normalized.split(':');
          const paddedHours = hours.padStart(2, '0');
          const paddedMinutes = (minutes || '00').padStart(2, '0');
          return `${paddedHours}:${paddedMinutes}`;
        };

        startTime = parseTime(timeParts[0]);
        endTime = parseTime(timeParts[1]);
      }
    }
    
    // Convert full day names (monday) to short names (mon) for the form
    const shortDays = Array.isArray(show.days) 
      ? show.days.map(toShortDayName).filter(Boolean)
      : [];
    
    setFormData({
      title: show.title || "",
      presenter: show.description || "",
      description: "",
      isActive: show.isActive ?? true,
      startTime: startTime,
      endTime: endTime,
      days: shortDays,
    });
    
    setIsDialogOpen(true);
  }

  const handleDelete = async (show: GroupedShow) => {
    if (!confirm(`Delete "${show.title}"? This will remove it from all scheduled days.`)) return
    try {
      setError("")
      const key = generateShowKey(show.title, show.time)
      await deleteShow(key, [], show.showIds)
      setSuccess("Show deleted successfully.")
      // Real-time listener will automatically update the UI
    } catch (err) {
      console.error("Delete error:", err)
      setError(err instanceof Error ? err.message : "Failed to delete show. Please try again.")
    }
  }

  // Shows are already grouped by getShows(), so use them directly
  // Sort shows by time, then by title for consistent display
  const sortedShows = [...shows].sort((a, b) => {
    const timeCompare = a.time.localeCompare(b.time)
    if (timeCompare !== 0) return timeCompare
    return a.title.localeCompare(b.title)
  })

  const formatDays = (days: string[]) => {
    // Convert full day names to short names if needed, then format
    const shortDays = days.map(d => {
      const short = toShortDayName(d)
      return DAY_LABEL[short] || d.toUpperCase()
    })
    return shortDays.join(", ")
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col">
        <DashboardHeader title="Shows" />

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
                    `${sortedShows.length} show${sortedShows.length !== 1 ? "s" : ""}`
                  )}
                </h2>
              </div>
              <Button
                onClick={() => { resetForm(); setIsDialogOpen(true) }}
                className="bg-radio-gold text-radio-black hover:bg-radio-gold/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Show
              </Button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-radio-gold" />
                <div className="text-white/70">
                  <p className="text-lg">Loading shows...</p>
                  <p className="text-sm">Fetching data from database</p>
                </div>
              </div>
            ) : sortedShows.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-white/70 mb-4">
                  <h3 className="text-xl font-semibold mb-2">No shows yet</h3>
                  <p>Get started by adding your first show</p>
                </div>
              </div>
            ) : (
              /* Shows Grid - Already grouped by title and time */
              <div className="space-y-4">
                {sortedShows.map((show) => (
                  <Card
                    key={show.id}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{show.title}</CardTitle>
                          {show.days.length > 1 && (
                            <div className="text-xs text-white/60 mt-1">
                              Repeats on {show.days.length} day{show.days.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
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
                            onClick={() => handleDelete(show)}
                            className="border-radio-red text-radio-red hover:bg-radio-red hover:text-white bg-transparent"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-radio-gold" />
                            <span className="font-medium">{show.time}</span>
                          </div>
                          {show.description && (
                            <div className="flex items-center space-x-2 text-sm">
                              <User className="h-4 w-4 text-radio-gold" />
                              <span>{show.description}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                            <span className="text-xs text-white/60 uppercase">Days:</span>
                            <div className="flex flex-wrap gap-1">
                              {show.days.map((day) => {
                                const shortDay = toShortDayName(day)
                                return (
                                  <span
                                    key={day}
                                    className="px-2 py-1 text-xs font-medium bg-radio-gold/20 text-radio-gold rounded border border-radio-gold/30"
                                  >
                                    {DAY_LABEL[shortDay] || day.toUpperCase()}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
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
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { setIsDialogOpen(false); resetForm() } }}>
          <DialogContent className="bg-radio-black border-radio-gold text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingShow ? 'Edit Show' : 'Add New Show'}</DialogTitle>
              <DialogDescription className="text-white/70">
                {editingShow ? 'Update the show details' : 'Fill in the details for the new show'}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert className="border-radio-red/50 bg-radio-red/10">
                <AlertCircle className="h-4 w-4 text-radio-red" />
                <AlertDescription className="text-radio-red">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Show Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter show title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
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
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Days *</Label>
                <div className="grid grid-cols-4 gap-3">
                  {DAY_OPTIONS.map((day) => (
                    <label key={day} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className="h-4 w-4 rounded border-white/20 bg-white/10 text-radio-gold focus:ring-2 focus:ring-radio-gold"
                        disabled={submitting}
                      />
                      <span>{DAY_LABEL[day]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  disabled={submitting}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsDialogOpen(false); resetForm() }}
                  className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
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
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}