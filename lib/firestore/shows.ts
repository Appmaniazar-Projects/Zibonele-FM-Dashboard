import { getFirebaseInstances, serverTimestamp } from "@/lib/firebase"

export interface Show {
  id?: string
  title: string
  description: string
  presenter: string
  time: string // e.g. "08h00 - 09h00"
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | "mon"
    | "tue"
    | "wed"
    | "thu"
    | "fri"
    | "sat"
    | "sun"
  isActive: boolean
  createdAt?: any
  updatedAt?: any
}

// Grouped view used by the dashboard UI
export interface GroupedShow extends Omit<Show, "id" | "day" | "createdAt" | "updatedAt"> {
  id: string
  days: string[]
  showIds: Record<string, string> // day -> showId
}

const SHOWS_PATH = "weeklySchedule"

// Helper to get short day name for database paths (monday -> mon, etc.)
// Firebase uses short day names: mon, tue, wed, thu, fri, sat, sun
const getShortDayName = (day: string): string => {
  const dayMap: Record<string, string> = {
    monday: "mon",
    tuesday: "tue",
    wednesday: "wed",
    thursday: "thu",
    friday: "fri",
    saturday: "sat",
    sunday: "sun",
    mon: "mon",
    tue: "tue",
    wed: "wed",
    thu: "thu",
    fri: "fri",
    sat: "sat",
    sun: "sun",
  }
  return dayMap[day.toLowerCase()] || day.toLowerCase()
}

// Helper to normalize day names for grouping/display (mon -> monday, etc.)
const normalizeDayName = (day: string): string => {
  const dayMap: Record<string, string> = {
    mon: "monday",
    tue: "tuesday",
    wed: "wednesday",
    thu: "thursday",
    fri: "friday",
    sat: "saturday",
    sun: "sunday",
    monday: "monday",
    tuesday: "tuesday",
    wednesday: "wednesday",
    thursday: "thursday",
    friday: "friday",
    saturday: "saturday",
    sunday: "sunday",
  }
  return dayMap[day.toLowerCase()] || day.toLowerCase()
}

// Add a show to one or more days
export const addShow = async (days: string[], showData: Omit<Show, "id" | "day" | "createdAt" | "updatedAt">) => {
  try {
    console.log(`Adding show to days:`, { days, showData })
    const { db } = await getFirebaseInstances()
    const { ref, push, set } = await import("firebase/database")

    const showIds: string[] = []

    // Use short day names for database paths (Firebase uses: mon, tue, wed, etc.)
    for (const day of days) {
      const shortDay = getShortDayName(day)
      const dayShowsRef = ref(db, `${SHOWS_PATH}/${shortDay}`)
      const newShowRef = push(dayShowsRef)

      const showWithTimestamps = {
        ...showData,
        day: shortDay, // Store short day name in database
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await set(newShowRef, showWithTimestamps)
      console.log(`✅ Show added to ${shortDay} with ID:`, newShowRef.key)
      showIds.push(newShowRef.key!)
    }

    return showIds
  } catch (error) {
    console.error("❌ Error adding show:", error)
    throw new Error(`Failed to add show: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Get the weekly schedule
export const getWeeklySchedule = async (): Promise<Record<string, Show[]>> => {
  try {
    console.log("Fetching weekly schedule...")
    const { db } = await getFirebaseInstances()
    const { ref, get } = await import("firebase/database")
    const scheduleRef = ref(db, SHOWS_PATH)
    const snapshot = await get(scheduleRef)

    // Database uses short day names (mon, tue, etc.), but we normalize to full names for grouping
    const schedule: Record<string, Show[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    }

    if (snapshot.exists()) {
      const data = snapshot.val()
      Object.entries(data).forEach(([day, dayShows]) => {
        if (dayShows) {
          // Database has short day names (mon, tue, etc.), normalize to full names for grouping
          const normalizedDay = normalizeDayName(day)
          
          // Use normalized day for grouping (monday, tuesday, etc.)
          if (!schedule[normalizedDay]) {
            schedule[normalizedDay] = []
          }
          
          schedule[normalizedDay] = Object.entries(dayShows)
            .map(([id, show]: [string, any]) => ({
              id,
              ...show,
              day: normalizedDay, // Use normalized day for grouping
              time: show.time || "",
              title: show.title || "",
              description: show.description || "",
              presenter: show.presenter || "",
              genre: show.genre || "",
              isActive: show.isActive ?? true,
            }))
            .sort((a, b) => a.time.localeCompare(b.time))
        }
      })
    }

    console.log("✅ Fetched weekly schedule")
    return schedule
  } catch (error) {
    console.error("❌ Error getting weekly schedule:", error)
    throw new Error(`Failed to fetch schedule: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Get all shows, grouped by title and time
export const getShows = async (): Promise<GroupedShow[]> => {
  const schedule = await getWeeklySchedule()
  return groupShows(schedule)
}

// Get shows by day
export const getShowsByDay = async (day: string): Promise<Show[]> => {
  const schedule = await getWeeklySchedule()
  return schedule[day.toLowerCase()] || []
}

// Helper function to group shows by title and time (used by both getShows and subscribeToShows)
const groupShows = (schedule: Record<string, Show[]>): GroupedShow[] => {
  const showsMap = new Map<string, GroupedShow>()

  for (const [normalizedDay, dayShows] of Object.entries(schedule)) {
    // normalizedDay is full name (monday, tuesday), but we need short name for showIds (database paths)
    const shortDay = getShortDayName(normalizedDay)
    const typedDay = normalizedDay as Show["day"]

    for (const show of dayShows) {
      const showKey = `${show.title.toLowerCase()}-${show.time}`

      if (!showsMap.has(showKey)) {
        showsMap.set(showKey, {
          ...show,
          id: showKey,
          days: [typedDay], // Store normalized day for display
          showIds: { [shortDay]: show.id || "" }, // Store short day name for database paths
        })
      } else {
        const existingShow = showsMap.get(showKey)!
        existingShow.days.push(typedDay)
        existingShow.showIds[shortDay] = show.id || "" // Use short day name for database paths
      }
    }
  }

  const shows = Array.from(showsMap.values())

  return shows.sort((a, b) => {
    const timeCompare = a.time.localeCompare(b.time)
    if (timeCompare !== 0) return timeCompare
    return a.title.localeCompare(b.title)
  })
}

// Subscribe to shows (real-time updates)
export const subscribeToShows = (callback: (shows: GroupedShow[]) => void) => {
  console.log("Setting up real-time subscription for shows...")

  const setupSubscription = async () => {
    const { db } = await getFirebaseInstances()
    
    if (!db) {
      console.error("❌ No database instance available for shows subscription")
      callback([])
      return () => {} // Return no-op cleanup function
    }
    
    const { ref, onValue } = await import("firebase/database")

    const showsRef = ref(db, SHOWS_PATH)

    const unsubscribe = onValue(
      showsRef,
      (snapshot) => {
        console.log("📡 Realtime Database: Received shows update...")
        
        const schedule: Record<string, Show[]> = {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        }

        if (snapshot.exists()) {
          const data = snapshot.val()
          Object.entries(data).forEach(([day, dayShows]) => {
            if (dayShows) {
              // Database has short day names (mon, tue, etc.), normalize to full names for grouping
              const normalizedDay = normalizeDayName(day)
              
              // Use normalized day for grouping (monday, tuesday, etc.)
              if (!schedule[normalizedDay]) {
                schedule[normalizedDay] = []
              }
              
              schedule[normalizedDay] = Object.entries(dayShows)
                .map(([id, show]: [string, any]) => ({
                  id,
                  ...show,
                  day: normalizedDay, // Use normalized day for grouping
                  time: show.time || "",
                  title: show.title || "",
                  description: show.description || "",
                  presenter: show.presenter || "",
                  genre: show.genre || "",
                  isActive: show.isActive ?? true,
                }))
                .sort((a, b) => a.time.localeCompare(b.time))
            }
          })
        }

        // Group shows by title and time
        const groupedShows = groupShows(schedule)
        
        console.log(`✅ Processed ${groupedShows.length} grouped show(s)`)
        callback(groupedShows)
      },
      (error) => {
        console.error("❌ Error in shows subscription:", error)
        callback([])
      },
    )

    return () => {
      console.log("🔌 Cleaning up shows subscription...")
      unsubscribe()
    }
  }

  let unsubscribeFunction: (() => void) | null = null

  setupSubscription()
    .then((unsub) => {
      unsubscribeFunction = unsub
    })
    .catch((error) => {
      console.error("❌ Error setting up shows subscription:", error)
      callback([])
    })

  return () => {
    console.log("🔌 Cleaning up shows subscription (outer)...")
    if (unsubscribeFunction) {
      unsubscribeFunction()
    }
  }
}

// Update a show across all its scheduled days
export const updateShow = async (
  oldShowKey: string,
  showData: Partial<Show>,
  newDays: string[] = [],
  oldShowIds?: Record<string, string>
) => {
  try {
    console.log(`Updating show ${oldShowKey} on days:`, { newDays, showData, oldShowIds })
    const { db } = await getFirebaseInstances()
    
    if (!db) {
      throw new Error("Database not available")
    }
    
    const { ref, update, remove, set, push } = await import("firebase/database")

    // Convert to short day names for database paths (Firebase uses: mon, tue, etc.)
    const shortNewDays = newDays.map(getShortDayName)
    const schedule = await getWeeklySchedule()
    
    // Determine if title or time changed (which would change the showKey)
    // Need to get the full showData to check properly
    const fullShowData = {
      title: showData.title || '',
      time: showData.time || '',
      ...showData
    }
    
    const newShowKey = fullShowData.title && fullShowData.time 
      ? `${fullShowData.title.toLowerCase().trim()}-${fullShowData.time}`
      : oldShowKey
    
    const titleOrTimeChanged = newShowKey !== oldShowKey
    console.log(`🔄 Title/Time changed: ${titleOrTimeChanged}, Old: ${oldShowKey}, New: ${newShowKey}`)
    
    // Get old show IDs - convert to short day names for database paths
    // oldShowIds might have normalized day names (monday) or short (mon)
    const oldDayShowIds: Record<string, string> = {} // short day name -> showId
    if (oldShowIds && Object.keys(oldShowIds).length > 0) {
      for (const [day, showId] of Object.entries(oldShowIds)) {
        const shortDay = getShortDayName(day) // Convert to short day name for database
        oldDayShowIds[shortDay] = showId
      }
    }
    
    // Always search the schedule for ALL entries matching the old showKey
    // Schedule uses normalized day names (monday, tuesday), but we need short names for database
    const allOldEntries: Record<string, string[]> = {} // short day name -> array of showIds
    
    for (const [normalizedDay, dayShows] of Object.entries(schedule)) {
      const shortDay = getShortDayName(normalizedDay) // Convert to short day name for database
      
      for (const [showId, show] of Object.entries(dayShows)) {
        const showTitle = (show as Show).title.toLowerCase()
        const showTime = (show as Show).time
        const showKeyForThisShow = `${showTitle}-${showTime}`
        
        if (showKeyForThisShow === oldShowKey) {
          if (!allOldEntries[shortDay]) {
            allOldEntries[shortDay] = []
          }
          allOldEntries[shortDay].push(showId)
        }
      }
    }
    
    // Merge with provided oldShowIds (prioritize provided IDs, but include all found)
    for (const [shortDay, showId] of Object.entries(oldDayShowIds)) {
      if (!allOldEntries[shortDay] || !allOldEntries[shortDay].includes(showId)) {
        if (!allOldEntries[shortDay]) {
          allOldEntries[shortDay] = []
        }
        allOldEntries[shortDay].push(showId)
      }
    }
    
    console.log(`📋 Found old entries to clean up (short day names):`, allOldEntries)
    
    const updates: Record<string, any> = {}
    const removals: Promise<void>[] = []
    const additions: Promise<void>[] = []
    
    // If title/time changed, delete ALL old entries matching the old showKey
    if (titleOrTimeChanged) {
      console.log(`🔄 Title/time changed - cleaning up ALL old entries...`)
      for (const [day, showIds] of Object.entries(allOldEntries)) {
        for (const showId of showIds) {
          const oldShowRef = ref(db, `${SHOWS_PATH}/${day}/${showId}`)
          removals.push(remove(oldShowRef))
          console.log(`🗑️ Will delete old entry: ${day}/${showId}`)
        }
      }
      
      // Add new entries for all new days (use short day names for database)
      for (const day of shortNewDays) {
        const dayShowsRef = ref(db, `${SHOWS_PATH}/${day}`)
        const newShowRef = push(dayShowsRef)
        const showWithTimestamps = {
          ...fullShowData,
          day, // Store short day name
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        additions.push(set(newShowRef, showWithTimestamps))
        console.log(`➕ Will add new entry: ${day}`)
      }
    } else {
      // Title/time didn't change - update existing entries or add/remove days
      // allOldEntries uses short day names, shortNewDays also uses short day names
      const allDays = new Set([...Object.keys(allOldEntries), ...shortNewDays])
      
      for (const day of allDays) {
        // day is already a short day name (mon, tue, etc.)
        const wasInOldDays = day in allOldEntries && allOldEntries[day].length > 0
        const isInNewDays = shortNewDays.includes(day)
        const oldShowIdsForDay = allOldEntries[day] || []
        
        // Title/time didn't change, just update existing entries
        if (wasInOldDays && isInNewDays) {
          // Update the first existing entry (if multiple exist, delete extras)
          const primaryShowId = oldShowIdsForDay[0]
          if (primaryShowId) {
            const showRef = `${SHOWS_PATH}/${day}/${primaryShowId}`
            const existingShow = schedule[day]?.find((s: Show) => s.id === primaryShowId)
            updates[showRef] = {
              ...existingShow,
              ...showData,
              updatedAt: serverTimestamp(),
            }
            
            // Delete any duplicate entries for this day
            for (let i = 1; i < oldShowIdsForDay.length; i++) {
              const duplicateRef = ref(db, `${SHOWS_PATH}/${day}/${oldShowIdsForDay[i]}`)
              removals.push(remove(duplicateRef))
              console.log(`🗑️ Will delete duplicate entry: ${day}/${oldShowIdsForDay[i]}`)
            }
          }
        } else if (wasInOldDays && !isInNewDays) {
          // Remove from this day - delete ALL entries
          for (const showId of oldShowIdsForDay) {
            const oldShowRef = ref(db, `${SHOWS_PATH}/${day}/${showId}`)
            removals.push(remove(oldShowRef))
            console.log(`🗑️ Will remove from day: ${day}/${showId}`)
          }
        } else if (!wasInOldDays && isInNewDays) {
          // Add to this day (day is already short name: mon, tue, etc.)
          const dayShowsRef = ref(db, `${SHOWS_PATH}/${day}`)
          const newShowRef = push(dayShowsRef)
          const showWithTimestamps = {
            ...fullShowData,
            day, // Store short day name
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
          additions.push(set(newShowRef, showWithTimestamps))
          console.log(`➕ Will add to day: ${day}`)
        }
      }
    }
    
    // Execute all operations in the correct order:
    // 1. First, delete old entries (especially important when title/time changed)
    // 2. Then update existing entries
    // 3. Finally, add new entries
    
    // Wait for all deletions to complete first
    if (removals.length > 0) {
      console.log(`🗑️ Executing ${removals.length} deletion(s)...`)
      try {
        await Promise.all(removals)
        console.log(`✅ All deletions completed`)
        // Small delay to ensure Firebase has processed the deletions
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error during deletions:`, error)
        throw error
      }
    }
    
    // Then do updates
    if (Object.keys(updates).length > 0) {
      console.log(`📝 Executing ${Object.keys(updates).length} update(s)...`)
      try {
        const dbRef = ref(db)
        await update(dbRef, updates)
        console.log(`✅ All updates completed`)
        // Small delay to ensure Firebase has processed the updates
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error during updates:`, error)
        throw error
      }
    }
    
    // Finally, add new entries
    if (additions.length > 0) {
      console.log(`➕ Executing ${additions.length} addition(s)...`)
      try {
        await Promise.all(additions)
        console.log(`✅ All additions completed`)
        // Small delay to ensure Firebase has processed the additions
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error during additions:`, error)
        throw error
      }
    }
    
    console.log(`✅ Updated show ${oldShowKey} -> ${newShowKey}`)
    console.log(`   Updates: ${Object.keys(updates).length}, Removals: ${removals.length}, Additions: ${additions.length}`)
    
    // Final verification - wait a bit more to ensure all operations are fully committed
    await new Promise(resolve => setTimeout(resolve, 200))
  } catch (error) {
    console.error(`❌ Error updating show ${oldShowKey}:`, error)
    throw new Error(`Failed to update show: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Delete a show from specific days or all days
export const deleteShow = async (showKey: string, days: string[] = [], showIds?: Record<string, string>) => {
  try {
    console.log(`Deleting show ${showKey} from days:`, days.length > 0 ? days : "all", "showIds:", showIds)
    const { db } = await getFirebaseInstances()
    
    if (!db) {
      throw new Error("Database not available")
    }
    
    const { ref, remove } = await import("firebase/database")

    const removals: Promise<void>[] = []
    
    // If showIds are provided, use them directly (more reliable)
    if (showIds && Object.keys(showIds).length > 0) {
      // Convert all day names to short format for database paths
      const daysToDelete = days.length > 0 
        ? days.map(getShortDayName)
        : Object.keys(showIds).map(getShortDayName)
      
      // Create a map of short day name -> showId
      const shortDayShowIds: Record<string, string> = {}
      for (const [day, showId] of Object.entries(showIds)) {
        const shortDay = getShortDayName(day)
        shortDayShowIds[shortDay] = showId
      }
      
      for (const shortDay of daysToDelete) {
        const showId = shortDayShowIds[shortDay]
        if (showId) {
          const showRef = ref(db, `${SHOWS_PATH}/${shortDay}/${showId}`)
          removals.push(remove(showRef))
          console.log(`🗑️ Queued deletion: ${shortDay}/${showId}`)
        } else {
          console.warn(`⚠️ No showId found for day: ${shortDay} in showIds:`, showIds)
        }
      }
    } else {
      // Fallback: find shows by matching showKey - find ALL entries matching this key
      const schedule = await getWeeklySchedule()
      const normalizedDays = days.length > 0 ? days.map(normalizeDayName) : null

      console.log(`🔍 Searching schedule for showKey: ${showKey}`)
      for (const [normalizedDay, dayShows] of Object.entries(schedule)) {
        // Skip if we're filtering by days and this day isn't in the list
        if (normalizedDays && !normalizedDays.includes(normalizedDay)) continue

        // Convert normalized day to short day name for database path
        const shortDay = getShortDayName(normalizedDay)

        for (const [showId, show] of Object.entries(dayShows)) {
          const showTitle = (show as Show).title.toLowerCase()
          const showTime = (show as Show).time
          const showKeyForThisShow = `${showTitle}-${showTime}`

          if (showKeyForThisShow === showKey) {
            const showRef = ref(db, `${SHOWS_PATH}/${shortDay}/${showId}`)
            removals.push(remove(showRef))
            console.log(`🗑️ Queued deletion (found by key): ${shortDay}/${showId}`)
          }
        }
      }
    }
    
    // Also check if showIds were provided but some entries might be missing
    // Find ALL entries matching the showKey to ensure complete deletion
    if (showIds && Object.keys(showIds).length > 0) {
      const schedule = await getWeeklySchedule()
      const normalizedDays = days.length > 0 
        ? days.map(normalizeDayName) 
        : Object.keys(showIds).map(d => normalizeDayName(d))
      
      for (const [normalizedDay, dayShows] of Object.entries(schedule)) {
        if (!normalizedDays.includes(normalizedDay)) continue
        
        const shortDay = getShortDayName(normalizedDay) // Convert to short day name for database
        
        for (const [showId, show] of Object.entries(dayShows)) {
          const showTitle = (show as Show).title.toLowerCase()
          const showTime = (show as Show).time
          const showKeyForThisShow = `${showTitle}-${showTime}`
          
          // If this matches the showKey but wasn't in showIds, delete it too
          if (showKeyForThisShow === showKey) {
            const wasInShowIds = Object.values(showIds).includes(showId)
            if (!wasInShowIds) {
              const showRef = ref(db, `${SHOWS_PATH}/${shortDay}/${showId}`)
              removals.push(remove(showRef))
              console.log(`🗑️ Queued deletion (orphaned entry): ${shortDay}/${showId}`)
            }
          }
        }
      }
    }

    if (removals.length === 0) {
      console.warn(`⚠️ No shows found to delete for key: ${showKey}`)
      throw new Error(`No shows found matching key: ${showKey}`)
    }

    await Promise.all(removals)
    console.log(`✅ Deleted show ${showKey} from ${removals.length} day(s)`)
  } catch (error) {
    console.error(`❌ Error deleting show ${showKey}:`, error)
    throw new Error(`Failed to delete show: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}


