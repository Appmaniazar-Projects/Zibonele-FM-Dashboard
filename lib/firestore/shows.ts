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

// Get all shows (flattened)
export const getShows = async (): Promise<Show[]> => {
  const schedule = await getWeeklySchedule();
  const shows = [];
  
  // First pass: collect all shows with their day information
  for (const [day, dayShows] of Object.entries(schedule)) {
    const typedDay = day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    
    for (const show of dayShows) {
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
  });
};

// Get shows by day
export const getShowsByDay = async (day: string): Promise<Show[]> => {
  const schedule = await getWeeklySchedule();
  return schedule[day.toLowerCase()] || [];
};

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
    throw new Error(`Failed to update show: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

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
    throw new Error(`Failed to delete show: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};