"use client"

<<<<<<< HEAD
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
=======
import React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addShow, deleteShow, getShows, updateShow, type Show, type GroupedShow } from "@/lib/firestore/shows"
import { AlertCircle, CheckCircle, Clock, Edit, Loader2, Plus, Trash2, User } from "lucide-react"
import { useEffect, useState } from "react"

export default function ShowsPage() {
  const [shows, setShows] = useState<GroupedShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<GroupedShow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
>>>>>>> 79b37be (fixing the shows page.)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
<<<<<<< HEAD
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
=======
    presenter: "",
    description: "",
    genre: "",
    isActive: true,
    startTime: "",
    endTime: "",
    days: [] as string[],
  });

  // Handle day selection
  const handleDayChange = (day: string) => {
    setFormData(prev => {
      if (prev.days.includes(day)) {
        return {
          ...prev,
          days: prev.days.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          days: [...prev.days, day]
        };
      }
    });
  };

  // Fetch shows on component mount
  useEffect(() => {
    refreshShows();
  }, []);

const refreshShows = async () => {
  try {
    console.clear();
    console.log("🔄 Starting to fetch shows...");
    const showsData = await getShows();
    
    // Normalize day names to full format
    const normalizeDay = (day: string): string => {
      const dayMap: Record<string, string> = {
        'mon': 'monday',
        'tue': 'tuesday',
        'tues': 'tuesday',
        'wed': 'wednesday',
        'thu': 'thursday',
        'thurs': 'thursday',
        'fri': 'friday',
        'sat': 'saturday',
        'sun': 'sunday'
      };
      return dayMap[day.toLowerCase()] || day.toLowerCase();
    };

    // Process shows to normalize day names and remove duplicates
    const processedShows = showsData.map(show => {
      // Normalize days and remove duplicates
      const normalizedDays = Array.from(new Set(
        show.days.map(day => normalizeDay(day))
      ));
      
      return {
        ...show,
        days: normalizedDays
      };
    });

    // Group shows by title and time
    const groupedShows = processedShows.reduce((acc: any[], show) => {
      const existingShowIndex = acc.findIndex(
        s => s.title === show.title && s.time === show.time
      );
      
      if (existingShowIndex >= 0) {
        // Merge days if show with same title and time exists
        const existingShow = acc[existingShowIndex];
        const combinedDays = [...new Set([...existingShow.days, ...show.days])];
        acc[existingShowIndex] = {
          ...existingShow,
          days: combinedDays
        };
      } else {
        // Add new show
        acc.push(show);
      }
      return acc;
    }, []);

    // Log processed data
    console.group('📊 Processed Shows Data');
    console.log('Total shows after grouping:', groupedShows.length);
    
    // Rest of your logging code...
    // Update the logging to use groupedShows instead of processedShows

    // Update state with grouped shows
    setShows(groupedShows);
    console.log("✅ Successfully processed and grouped shows");

  } catch (error) {
    console.error("❌ Error in refreshShows:", error);
    setError("Failed to load shows. Please try again later.");
  } finally {
    setLoading(false);
  }
};



>>>>>>> 79b37be (fixing the shows page.)

  // Auto-clear success/error messages
  useEffect(() => {
    if (success) {
<<<<<<< HEAD
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
=======
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);
>>>>>>> 79b37be (fixing the shows page.)

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
<<<<<<< HEAD
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
=======
      presenter: "",
      description: "",
      genre: "",
      isActive: true,
      startTime: "",
      endTime: "",
      days: [],
    });
    setEditingShow(null);
  };

  // Format time for storage (convert : to H)
  const formatForStorage = (time: string) => time.replace(':', 'H');
  
  // Format time from 04H00 to 04:00 for input fields
  const formatTimeForInput = (time: string) => {
    if (!time) return '';
    return time.replace('H', ':');
  };

  // Helper to generate a consistent show key (must match the backend format in shows.ts)
  const generateShowKey = (title: string, time: string) => {
    // Format should match exactly how it's done in shows.ts
    // In shows.ts: const showKey = `${show.title.toLowerCase()}-${show.time}`;
    return `${title.toLowerCase()}-${time}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    // Validate times
    if (!formData.startTime || !formData.endTime) {
      setError("Please provide both start and end times");
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      // Format times for storage (convert : to H)
      const formattedStartTime = formatForStorage(formData.startTime);
      const formattedEndTime = formatForStorage(formData.endTime);
      const timeString = `${formattedStartTime}-${formattedEndTime}`;

      // Create show data with all required fields
      const showData = {
        title: formData.title,
        presenter: formData.presenter,
        description: formData.description || '',
        genre: formData.genre || '',
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        time: `${formattedStartTime} - ${formattedEndTime}`,
        day: formData.days[0] || '', // Required by the Show interface, but we'll handle multiple days separately
      };

      if (editingShow) {
        // For editing, we need to handle days properly
        const currentDays = editingShow.days || [];
        const newDays = formData.days || [];
        const daysToRemove = currentDays.filter(day => !newDays.includes(day));
        const daysToAdd = newDays.filter(day => !currentDays.includes(day));
        const daysToUpdate = newDays.filter(day => currentDays.includes(day));

        // Generate a consistent show key using the original title and time
        const oldShowKey = generateShowKey(editingShow.title, editingShow.time);
        const newShowKey = generateShowKey(showData.title, showData.time);

        // If the title or time changed, we need to delete the old show and create a new one
        if (oldShowKey !== newShowKey) {
          // Delete the old show from all days
          await deleteShow(oldShowKey);
          
          // Create the show with the new details on all selected days
          if (newDays.length > 0) {
            await addShow(newDays, showData);
          }
        } else {
          // Only update the existing show if the key hasn't changed
          
          // First, update existing days
          if (daysToUpdate.length > 0) {
            const showUpdateData: Partial<Show> = {
              title: formData.title,
              presenter: formData.presenter,
              description: formData.description,
              genre: formData.genre,
              isActive: formData.isActive,
              time: `${formattedStartTime} - ${formattedEndTime}`,
              day: (daysToUpdate[0] as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday') || 'monday'
            };
            await updateShow(newShowKey, showUpdateData, daysToUpdate);
          }

          // Remove from days that are no longer selected
          if (daysToRemove.length > 0) {
            await deleteShow(newShowKey, daysToRemove);
          }

          // Add to new days
          if (daysToAdd.length > 0) {
            await addShow(daysToAdd, showData);
          }
        }

        setSuccess("Show updated successfully!");
      } else {
        // For new shows
        const showToAdd = {
          title: formData.title,
          presenter: formData.presenter,
          description: formData.description,
          genre: formData.genre,
          isActive: formData.isActive,
          time: `${formattedStartTime} - ${formattedEndTime}`,
          // Add a default day (it will be overridden by the days parameter)
          day: formData.days[0] || 'monday'
        };
        
        await addShow(formData.days, showToAdd);
        setSuccess("Show added successfully!");
      }
      
      await refreshShows();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving show:", error);
      setError("Failed to save show. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (show: GroupedShow) => {
    setEditingShow(show);
    
    // Split existing time into start and end times if it contains a dash
    let startTime = '';
    let endTime = '';
    
    if (show.time) {
      // Handle both "04H00 - 05H00" and "04:00 - 05:00" formats
      const timeParts = show.time.split(' - ');
      if (timeParts.length === 2) {
        startTime = timeParts[0].trim();
        endTime = timeParts[1].trim();
      }
    }
    
    // Format time for input fields (convert H to :)
    const formatTime = (time: string) => {
      if (!time) return '';
      // Remove any existing colons and add a colon before the last 2 characters
      return time.replace('H', '').replace(/(\d{2})(\d{2})/, '$1:$2');
    };
    
    setFormData({
      title: show.title,
      presenter: show.presenter || '',
      description: show.description || '',
      genre: show.genre || '',
      isActive: show.isActive !== undefined ? show.isActive : true,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      days: Array.isArray(show.days) ? [...show.days] : [show.days || ''],
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (show: GroupedShow) => {
    if (window.confirm(`Are you sure you want to delete "${show.title}"?`)) {
      try {
        // Generate the show key using the same format as in the update function
        const showKey = generateShowKey(show.title, show.time);
        await deleteShow(showKey);
        await refreshShows();
        setSuccess("Show deleted successfully!");
      } catch (error) {
        console.error("Error deleting show:", error);
        setError("Failed to delete show. Please try again.");
      }
    }
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
      setIsDialogOpen(false);
    }
  };

  // Handle opening new show dialog
  const handleOpenNewShow = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Format days for display with responsive design
  const formatDays = (days: string[]) => {
    const dayLabels: Record<string, string> = {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun"
    };
    
    const fullDayLabels: Record<string, string> = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    };

    // Sort days in the order they appear in the week
    const sortedDays = [...days].sort((a, b) => 
      Object.keys(dayLabels).indexOf(a) - Object.keys(dayLabels).indexOf(b)
    );

    // Function to format days with short names (for mobile/compact view)
    const formatWithShortNames = () => {
      // Check for weekdays (Mon-Fri)
      if (sortedDays.length === 5 && 
          sortedDays[0] === 'monday' && 
          sortedDays[4] === 'friday') {
        return "Weekdays (Mon-Fri)";
      }
      
      // Check for weekend (Sat-Sun)
      if (sortedDays.length === 2 && 
          sortedDays[0] === 'saturday' && 
          sortedDays[1] === 'sunday') {
        return "Weekend (Sat-Sun)";
      }

      // Check for full week (Mon-Sun)
      if (sortedDays.length === 7) {
        return "Mon-Sun";
      }

      // For other cases, format with short names
      const dayIndices = sortedDays.map(day => Object.keys(dayLabels).indexOf(day));
      const result: string[] = [];
      let start = 0;

      for (let i = 1; i <= dayIndices.length; i++) {
        if (i === dayIndices.length || dayIndices[i] !== dayIndices[i - 1] + 1) {
          const startDay = dayLabels[sortedDays[start]];
          const endDay = dayLabels[sortedDays[i - 1]];
          
          if (i - start > 1) {
            // For ranges of 2+ consecutive days
            result.push(`${startDay}-${endDay}`);
          } else {
            // Single day
            result.push(startDay);
          }
          start = i;
        }
      }

      return result.join(", ");
    };

    // For mobile view, always use short names
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return formatWithShortNames();
    }

    // For desktop view, use full day names
    if (sortedDays.length === 5 && 
        sortedDays[0] === 'monday' && 
        sortedDays[4] === 'friday') {
      return "Weekdays (Monday-Friday)";
    }
    
    if (sortedDays.length === 2 && 
        sortedDays[0] === 'saturday' && 
        sortedDays[1] === 'sunday') {
      return "Weekend (Saturday-Sunday)";
    }

    if (sortedDays.length === 7) {
      return "Monday-Sunday";
    }

    // For other cases, use full day names
    return sortedDays.map(day => fullDayLabels[day] || day).join(", ")
  };

  return (
    <div className="flex min-h-screen flex-col bg-radio-dark">
      <DashboardLayout>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <DashboardHeader
            title="Shows"
            text="Manage radio shows and their schedules"
          />
          
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
          

{/* Shows list */}
<div className="space-y-4">
  {loading ? (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-radio-gold" />
    </div>
  ) : shows.length > 0 ? (
    // Group shows by their name
    Object.entries(
      shows.reduce((acc, show) => {
        const showName = show.title;
        if (!acc[showName]) {
          acc[showName] = {
            ...show,
            // Initialize with empty days array for this show
            days: []
          };
        }
        // Add unique days to the show
        show.days.forEach(day => {
          if (!acc[showName].days.includes(day)) {
            acc[showName].days.push(day);
          }
        });
        return acc;
      }, {} as Record<string, any>)
    ).map(([showName, show]) => (
      <Card key={showName} className="border-radio-dark-lighter bg-radio-dark-light">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-white">
              {showName}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(show)}
                className="text-radio-gray-light hover:text-radio-gold"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(show)}
                className="text-radio-gray-light hover:text-radio-red"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-radio-gray-light">
              <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>{show.time}</span>
            </div>
            {show.presenter && (
              <div className="flex items-center text-sm text-radio-gray-light">
                <User className="mr-2 h-4 w-4 flex-shrink-0" />
                <span>{show.presenter}</span>
              </div>
            )}
          <div className="flex flex-wrap gap-2 mt-2">
  {show.days.map((day: string) => (
    <span 
      key={day} 
      className="px-2 py-1 bg-radio-dark-lighter text-xs rounded-md text-radio-gray-light"
    >
      {day.charAt(0).toUpperCase() + day.slice(1)}
    </span>
  ))}
</div>
          </div>
        </CardContent>
      </Card>
    ))
  ) : (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-radio-dark-lighter p-12 text-center">
      <p className="mb-4 text-radio-gray-light">No shows found</p>
      <Button onClick={handleOpenNewShow}>
        <Plus className="mr-2 h-4 w-4" />
        Add Show
      </Button>
    </div>
  )}
</div>





          
          {/* Add Show Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="sm:max-w-[450px] bg-[#4a4f5a] border-[#6b7180]">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-bold">
                  {editingShow ? 'Edit Show' : 'Add New Show'}
                </DialogTitle>
                <DialogDescription className="text-gray-200 mt-1">
                  {editingShow ? 'Update the show details' : 'Add a new radio show to the schedule'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-200 text-sm font-medium">
                    Show Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 bg-[#3a3f49] border-[#6b7180] text-white placeholder-gray-400 focus:border-[#d2a42a] focus:ring-2 focus:ring-[#d2a42a]/30 rounded-md transition-colors"
                    placeholder="Enter show title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presenter" className="text-gray-200 text-sm font-medium">
                    Presenter <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="presenter"
                    value={formData.presenter}
                    onChange={(e) => setFormData({ ...formData, presenter: e.target.value })}
                    className="mt-1 bg-[#3a3f49] border-[#6b7180] text-white placeholder-gray-400 focus:border-[#d2a42a] focus:ring-2 focus:ring-[#d2a42a]/30 rounded-md transition-colors"
                    placeholder="Enter presenter name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-gray-200 text-sm font-medium">
                      Start Time <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="mt-1 bg-[#3a3f49] border-[#6b7180] text-white placeholder-gray-400 focus:border-[#d2a42a] focus:ring-2 focus:ring-[#d2a42a]/30 rounded-md transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-gray-200 text-sm font-medium">
                      End Time <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="mt-1 bg-[#3a3f49] border-[#6b7180] text-white placeholder-gray-400 focus:border-[#d2a42a] focus:ring-2 focus:ring-[#d2a42a]/30 rounded-md transition-colors"
                      required
                      min={formData.startTime}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200 text-sm font-medium block mb-2">
                    Days <span className="text-red-400">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={day}
                          checked={formData.days.includes(day)}
                          onChange={() => handleDayChange(day)}
                          className="h-4 w-4 rounded border-gray-500 bg-[#3a3f49] text-[#d2a42a] focus:ring-[#d2a42a]"
                        />
                        <label 
                          htmlFor={day}
                          className="text-sm font-medium text-gray-200 capitalize cursor-pointer"
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-red-500 bg-red-600 text-white hover:bg-red-700 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#d2a42a] hover:bg-[#c09725] text-white font-medium"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingShow ? 'Updating...' : 'Adding...'}
                      </>
                    ) : editingShow ? (
                      'Update Show'
                    ) : (
                      'Add Show'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <FloatingActionButton onClick={handleOpenNewShow} />
        </div>
      </DashboardLayout>
    </div>
  );
>>>>>>> 79b37be (fixing the shows page.)
}
