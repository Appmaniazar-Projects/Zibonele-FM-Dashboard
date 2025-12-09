import { getFirebaseInstances, serverTimestamp } from "@/lib/firebase"

export interface Show {
  id?: string;
  title: string;
  description: string;
  presenter: string;
  time: string;  // e.g. "08:00"
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  genre: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

const SHOWS_PATH = "weeklySchedule"  // Using the weeklySchedule path

<<<<<<< HEAD
// Add a new show to a specific day
export const addShow = async (day: string, showData: Omit<Show, "id" | "day" | "createdAt" | "updatedAt">) => {
  try {
    console.log(`Adding show to ${day}:`, showData);
    const { db } = await getFirebaseInstances();
    const { ref, push, set } = await import("firebase/database");
    
    // Create a reference to the specific day's shows
    const dayShowsRef = ref(db, `${SHOWS_PATH}/${day}`);
    const newShowRef = push(dayShowsRef);
    
    const showWithTimestamps = {
      ...showData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await set(newShowRef, showWithTimestamps);
    console.log("✅ Show added with ID:", newShowRef.key);
    return newShowRef.key!;
=======
// Add a show to one or more days
export const addShow = async (days: string[], showData: Omit<Show, "id" | "day" | "createdAt" | "updatedAt">) => {
  try {
    console.log(`Adding show to days:`, { days, showData });
    const { db } = await getFirebaseInstances();
    const { ref, push, set } = await import("firebase/database");
    
    const showIds: string[] = [];
    
    // Add the show to each specified day
    for (const day of days) {
      const dayShowsRef = ref(db, `${SHOWS_PATH}/${day}`);
      const newShowRef = push(dayShowsRef);
      
      const showWithTimestamps = {
        ...showData,
        day, // Store the day for backward compatibility
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await set(newShowRef, showWithTimestamps);
      console.log(`✅ Show added to ${day} with ID:`, newShowRef.key);
      showIds.push(newShowRef.key!);
    }
    
    return showIds;
>>>>>>> 79b37be (fixing the shows page.)
  } catch (error) {
    console.error("❌ Error adding show:", error);
    throw new Error(`Failed to add show: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// Get the weekly schedule
export const getWeeklySchedule = async (): Promise<Record<string, Show[]>> => {
  try {
    console.log("Fetching weekly schedule...");
    const { db } = await getFirebaseInstances();
    const { ref, get } = await import("firebase/database");
    const scheduleRef = ref(db, SHOWS_PATH);
    const snapshot = await get(scheduleRef);
    
    const schedule: Record<string, Show[]> = {
      monday: [], tuesday: [], wednesday: [], 
      thursday: [], friday: [], saturday: [], sunday: []
    };

    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.entries(data).forEach(([day, dayShows]) => {
        if (dayShows) {
          schedule[day] = Object.entries(dayShows).map(([id, show]: [string, any]) => ({
            id,
            ...show,
            day, // Ensure day is set correctly
            time: show.time || "",
            title: show.title || "",
            description: show.description || "",
            presenter: show.presenter || "",
            genre: show.genre || "",
            isActive: show.isActive ?? true
          })).sort((a, b) => a.time.localeCompare(b.time));
        }
      });
    }

    console.log("✅ Fetched weekly schedule");
    return schedule;
  } catch (error) {
    console.error("❌ Error getting weekly schedule:", error);
    throw new Error(`Failed to fetch schedule: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

<<<<<<< HEAD
// Get all shows (flattened)
export const getShows = async (): Promise<Show[]> => {
  const schedule = await getWeeklySchedule();
  const shows = [];
  
  // First pass: collect all shows with their day information
=======
// Group shows by title and time to handle multi-day shows
export interface GroupedShow extends Omit<Show, 'id' | 'day' | 'createdAt' | 'updatedAt'> {
  id: string;
  days: string[];
  showIds: Record<string, string>; // day -> showId
  time: string;
  presenter: string;
  title: string;
  description: string;
  genre: string;
  isActive: boolean;
}

// Get all shows, grouped by title and time
export const getShows = async (): Promise<GroupedShow[]> => {
  const schedule = await getWeeklySchedule();
  const showsMap = new Map<string, GroupedShow>();
  
  // First pass: collect all shows and group them by title and time
>>>>>>> 79b37be (fixing the shows page.)
  for (const [day, dayShows] of Object.entries(schedule)) {
    const typedDay = day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    
    for (const show of dayShows) {
<<<<<<< HEAD
      // Create a unique ID by combining day, time, and title (or use existing ID if it exists)
      const uniqueId = show.id || `${typedDay}-${show.time}-${show.title}`.toLowerCase().replace(/\s+/g, '-');
      
      shows.push({
        ...show,
        id: uniqueId,
        day: typedDay,
      });
    }
  }

  // Log the shows for debugging
  console.log('Fetched shows:', shows);

  // Sort shows by day and time
  return shows.sort((a, b) => {
    const dayOrder: Record<string, number> = { 
      monday: 1, 
      tuesday: 2, 
      wednesday: 3, 
      thursday: 4, 
      friday: 5, 
      saturday: 6, 
      sunday: 7 
    };
    
    // First sort by day
    if (a.day !== b.day) {
      return (dayOrder[a.day as keyof typeof dayOrder] || 0) - 
             (dayOrder[b.day as keyof typeof dayOrder] || 0);
    }
    
    // Then by time
    return a.time.localeCompare(b.time);
=======
      // Create a unique key based on title and time
      const showKey = `${show.title.toLowerCase()}-${show.time}`;
      
      if (!showsMap.has(showKey)) {
        // Create a new grouped show
        showsMap.set(showKey, {
          ...show,
          id: showKey,
          days: [typedDay],
          showIds: { [typedDay]: show.id || '' },
        });
      } else {
        // Add day to existing show
        const existingShow = showsMap.get(showKey)!;
        existingShow.days.push(typedDay);
        existingShow.showIds[typedDay] = show.id || '';
      }
    }
  }

  // Convert map to array and sort
  const shows = Array.from(showsMap.values());
  
  // Sort shows by time and then by title
  return shows.sort((a, b) => {
    // First by time
    const timeCompare = a.time.localeCompare(b.time);
    if (timeCompare !== 0) return timeCompare;
    
    // Then by title
    return a.title.localeCompare(b.title);
>>>>>>> 79b37be (fixing the shows page.)
  });
};

// Get shows by day
export const getShowsByDay = async (day: string): Promise<Show[]> => {
  const schedule = await getWeeklySchedule();
  return schedule[day.toLowerCase()] || [];
};

<<<<<<< HEAD
// Update a show
export const updateShow = async (day: string, showId: string, showData: Partial<Show>) => {
  try {
    console.log(`Updating show ${showId} on ${day}:`, showData);
    const { db } = await getFirebaseInstances();
    const { ref, update } = await import("firebase/database");
    const showRef = ref(db, `${SHOWS_PATH}/${day}/${showId}`);
    
    await update(showRef, {
      ...showData,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Show ${showId} updated successfully`);
  } catch (error) {
    console.error(`❌ Error updating show ${showId}:`, error);
=======
// Update a show across all its scheduled days
export const updateShow = async (showKey: string, showData: Partial<Show>, days: string[] = []) => {
  try {
    console.log(`Updating show ${showKey} on days:`, { days, showData });
    const { db } = await getFirebaseInstances();
    const { ref, update, get, set } = await import("firebase/database");
    
    // If days are provided, update only those days
    // Otherwise, update all days the show is scheduled for
    const daysToUpdate = days.length > 0 ? days : [];
    
    // Get the current schedule to find all instances of this show
    const schedule = await getWeeklySchedule();
    const updates: Record<string, any> = {};
    
    // Find all instances of this show across all days
    for (const [day, dayShows] of Object.entries(schedule)) {
      for (const [showId, show] of Object.entries(dayShows)) {
        const showTitle = (show as Show).title.toLowerCase();
        const showTime = (show as Show).time;
        const showKeyForThisShow = `${showTitle}-${showTime}`;
        
        // Check if this is the show we want to update
        if (showKeyForThisShow === showKey) {
          // If days were specified, only update if this day is in the list
          if (daysToUpdate.length === 0 || daysToUpdate.includes(day)) {
            const showRef = `${SHOWS_PATH}/${day}/${showId}`;
            updates[showRef] = {
              ...show,
              ...showData,
              updatedAt: serverTimestamp(),
            };
          }
        }
      }
    }
    
    // Perform all updates in a single transaction
    if (Object.keys(updates).length > 0) {
      const dbRef = ref(db);
      await update(dbRef, updates);
      console.log(`✅ Updated show ${showKey} on ${Object.keys(updates).length} days`);
    }

    console.log(`✅ Show ${showKey} updated successfully`);
  } catch (error) {
    console.error(`❌ Error updating show ${showKey}:`, error);
>>>>>>> 79b37be (fixing the shows page.)
    throw new Error(`Failed to update show: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

<<<<<<< HEAD
// Delete a show
export const deleteShow = async (day: string, showId: string) => {
  try {
    console.log(`Deleting show ${showId} from ${day}`);
    const { db } = await getFirebaseInstances();
    const { ref, remove } = await import("firebase/database");
    const showRef = ref(db, `${SHOWS_PATH}/${day}/${showId}`);
    await remove(showRef);
    console.log(`✅ Show ${showId} deleted successfully`);
  } catch (error) {
    console.error(`❌ Error deleting show ${showId}:`, error);
=======
// Delete a show from specific days or all days
// If days is empty, removes the show from all days
export const deleteShow = async (showKey: string, days: string[] = []) => {
  try {
    console.log(`Deleting show ${showKey} from days:`, days.length > 0 ? days : 'all');
    const { db } = await getFirebaseInstances();
    const { ref, remove, get } = await import("firebase/database");
    
    // Get the current schedule to find all instances of this show
    const schedule = await getWeeklySchedule();
    const removals: Promise<void>[] = [];
    
    // Find all instances of this show across all days
    for (const [day, dayShows] of Object.entries(schedule)) {
      // Skip if specific days were provided and this day isn't in the list
      if (days.length > 0 && !days.includes(day)) continue;
      
      for (const [showId, show] of Object.entries(dayShows)) {
        const showTitle = (show as Show).title.toLowerCase();
        const showTime = (show as Show).time;
        const showKeyForThisShow = `${showTitle}-${showTime}`;
        
        // If this is the show we want to delete
        if (showKeyForThisShow === showKey) {
          const showRef = ref(db, `${SHOWS_PATH}/${day}/${showId}`);
          removals.push(remove(showRef));
        }
      }
    }
    
    // Wait for all deletions to complete
    await Promise.all(removals);
    console.log(`✅ Deleted show ${showKey} from ${removals.length} days`);
  } catch (error) {
    console.error(`❌ Error deleting show ${showKey}:`, error);
>>>>>>> 79b37be (fixing the shows page.)
    throw new Error(`Failed to delete show: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};