import { getFirebaseInstances, serverTimestamp } from "@/lib/firebase"

export interface Event {
  id?: string
  title: string
  description: string
  date: string
  time: string
  location: string
  imageUrl?: string
  isPublished: boolean
  createdAt?: any
  updatedAt?: any
}

const EVENTS_PATH = "events"

// Add a new event
export const addEvent = async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
  try {
    console.log("Adding event:", eventData)

    const { db } = await getFirebaseInstances()
    const { ref, push, set } = await import("firebase/database")

    const eventsRef = ref(db, EVENTS_PATH)
    const newEventRef = push(eventsRef)

    const eventWithTimestamps = {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await set(newEventRef, eventWithTimestamps)

    console.log("✅ Realtime Database: Event added with ID:", newEventRef.key)
    return newEventRef.key!
  } catch (error) {
    console.error("❌ Error adding event:", error)
    throw new Error(`Failed to add event: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Update an existing event
export const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
  try {
    console.log("Updating event:", eventId, eventData)

    const { db } = await getFirebaseInstances()
    const { ref, update } = await import("firebase/database")

    const eventRef = ref(db, `${EVENTS_PATH}/${eventId}`)

    const updateData = {
      ...eventData,
      updatedAt: serverTimestamp(),
    }

    await update(eventRef, updateData)

    console.log("✅ Event updated successfully")
    return true
  } catch (error) {
    console.error("❌ Error updating event:", error)
    throw new Error(`Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Delete an event
export const deleteEvent = async (eventId: string) => {
  try {
    console.log("Deleting event:", eventId)

    const { db } = await getFirebaseInstances()
    const { ref, remove } = await import("firebase/database")

    const eventRef = ref(db, `${EVENTS_PATH}/${eventId}`)
    await remove(eventRef)

    console.log("✅ Event deleted successfully")
    return true
  } catch (error) {
    console.error("❌ Error deleting event:", error)
    throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Get all events (one-time fetch)
export const getEvents = async (): Promise<Event[]> => {
  try {
    console.log("Fetching events...")

    const { db } = await getFirebaseInstances()
    const { ref, get } = await import("firebase/database")

    const eventsRef = ref(db, EVENTS_PATH)
    const snapshot = await get(eventsRef)

    const events: Event[] = []

    if (snapshot.exists()) {
      const data = snapshot.val()
      Object.keys(data).forEach((key) => {
        const eventData = data[key]
        events.push({
          id: key,
          title: eventData.title || "",
          description: eventData.description || "",
          date: eventData.date || "",
          time: eventData.time || "",
          location: eventData.location || "",
          imageUrl: eventData.imageUrl || "",
          isPublished: eventData.isPublished ?? false,
          createdAt: eventData.createdAt,
          updatedAt: eventData.updatedAt,
        } as Event)
      })
    }

    // Sort by creation time
    events.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt - a.createdAt
      }
      return a.title.localeCompare(b.title)
    })

    console.log("✅ Fetched events:", events.length)
    return events
  } catch (error) {
    console.error("❌ Error getting events:", error)
    throw new Error(`Failed to fetch events: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Subscribe to events (real-time updates)
export const subscribeToEvents = (callback: (events: Event[]) => void) => {
  console.log("Setting up real-time subscription for events...")

  const setupSubscription = async () => {
    const { db } = await getFirebaseInstances()
    const { ref, onValue, off } = await import("firebase/database")

    const eventsRef = ref(db, EVENTS_PATH)

    const unsubscribe = onValue(
      eventsRef,
      (snapshot) => {
        console.log("📡 Realtime Database: Received events update...")
        const events: Event[] = []

        if (snapshot.exists()) {
          const data = snapshot.val()
          Object.keys(data).forEach((key) => {
            const eventData = data[key]
            events.push({
              id: key,
              title: eventData.title || "",
              description: eventData.description || "",
              date: eventData.date || "",
              time: eventData.time || "",
              location: eventData.location || "",
              imageUrl: eventData.imageUrl || "",
              isPublished: eventData.isPublished ?? false,
              createdAt: eventData.createdAt,
              updatedAt: eventData.updatedAt,
            } as Event)
          })
        }

        // Sort by creation time
        events.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt - a.createdAt
          }
          return a.title.localeCompare(b.title)
        })

        console.log("✅ Processed events:", events.length)
        callback(events)
      },
      (error) => {
        console.error("❌ Error in events subscription:", error)
      },
    )

    return () => {
      off(eventsRef, "value", unsubscribe)
    }
  }

  let unsubscribeFunction: (() => void) | null = null

  setupSubscription()
    .then((unsub) => {
      unsubscribeFunction = unsub
    })
    .catch((error) => {
      console.error("❌ Error setting up events subscription:", error)
    })

  return () => {
    console.log("🔌 Cleaning up events subscription...")
    if (unsubscribeFunction) {
      unsubscribeFunction()
    }
  }
}
