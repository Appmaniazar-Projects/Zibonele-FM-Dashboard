import { getFirebaseInstances, serverTimestamp } from "@/lib/firebase"

const PROFILES_PATH = 'profiles'

export interface Profile {
  id?: string
  name: string
  author?: string
  schedule?: string
  bio: string
  email: string
  phone?: string
  role?: string
  imageUrl?: string
  socialMedia?: Record<string, string>
  shows?: string[]
  isActive: boolean
  createdAt?: any
  updatedAt?: any
}


export const addProfile = async (profileData: Omit<Profile, "id" | "createdAt" | "updatedAt">) => {
  try {
    console.log("Adding profile:", profileData)
    const { db } = await getFirebaseInstances()
    const { ref, push, set } = await import("firebase/database")

    const profilesRef = ref(db, PROFILES_PATH)
    const newProfileRef = push(profilesRef)

    const profileWithTimestamps = {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await set(newProfileRef, profileWithTimestamps)
    console.log("✅ Realtime Database: Profile added with ID:", newProfileRef.key)
    return newProfileRef.key!
  } catch (error) {
    console.error("❌ Error adding profile:", error)
    throw new Error(`Failed to add profile: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const updateProfile = async (id: string, profileData: Partial<Profile>) => {
  try {
    console.log(`Updating profile ${id}:`, profileData)
    const { db } = await getFirebaseInstances()
    const { ref, update } = await import("firebase/database")
    
    const profileRef = ref(db, `${PROFILES_PATH}/${id}`)
    
    await update(profileRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
    })
    
    console.log("✅ Realtime Database: Profile updated successfully")
  } catch (error) {
    console.error("❌ Error updating profile:", error)
    throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const deleteProfile = async (id: string) => {
  try {
    console.log("Deleting profile:", id)
    const { db } = await getFirebaseInstances()
    const { ref, remove } = await import("firebase/database")
    
    const profileRef = ref(db, `${PROFILES_PATH}/${id}`)
    await remove(profileRef)
    
    console.log("✅ Realtime Database: Profile deleted successfully")
    return true
  } catch (error) {
    console.error("❌ Error deleting profile:", error)
    throw new Error(`Failed to delete profile: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const getProfiles = async (): Promise<Profile[]> => {
  try {
    console.log("Fetching profiles...")
    const { db } = await getFirebaseInstances()
    const { ref, get } = await import("firebase/database")
    
    const profilesRef = ref(db, PROFILES_PATH)
    const snapshot = await get(profilesRef)
    const profiles: Profile[] = []

    if (snapshot.exists()) {
      const data = snapshot.val()
      Object.keys(data).forEach((key) => {
        const profileData = data[key]
        profiles.push({
          id: key,
          name: profileData.name || profileData.author || "",
          author: profileData.author || "",
          schedule: profileData.schedule || "",
          bio: profileData.bio || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          role: profileData.role || "",
          imageUrl: profileData.imageUrl || "",
          socialMedia: profileData.socialMedia || {},
          isActive: profileData.isActive !== undefined ? profileData.isActive : true,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
        } as Profile)
      })
    }

    // Sort by creation time
    profiles.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt - a.createdAt
      }
      return (a.name || "").localeCompare(b.name || "")
    })

    console.log("✅ Fetched profiles:", profiles.length)
    return profiles
  } catch (error) {
    throw new Error(`Failed to fetch profiles: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const subscribeToProfiles = (callback: (profiles: Profile[]) => void) => {
  console.log("1. Starting subscribeToProfiles...")
  
  // This will be populated asynchronously
  let unsubscribe = () => {
    console.log("Default unsubscribe called (was never properly set)")
  }
  
  // Initialize Firebase and set up the subscription
  const init = async () => {
    console.log("2. Starting Firebase initialization...")
    try {
      console.log("3. Getting Firebase instances...")
      const instances = await getFirebaseInstances()
      console.log("4. Firebase instances received:", {
        hasDb: !!instances.db,
        hasAuth: !!instances.auth,
        isUsingRealFirebase: instances.isUsingRealFirebase,
        isUsingRealDatabase: instances.isUsingRealDatabase
      })
      
      const { db } = instances
      
      if (!db) {
        console.error("❌ No database instance available")
        callback([])
        return
      }

      console.log("5. Importing Firebase database functions...")
      const { ref, onValue, off } = await import("firebase/database")
      console.log("6. Firebase database functions imported")

      const profilesRef = ref(db, PROFILES_PATH)
      console.log("7. Created database reference to:", PROFILES_PATH)

      console.log("8. Setting up onValue listener...")
      const unsubscribeFn = onValue(
        profilesRef,
        (snapshot) => {
          try {
            console.log("9. Received profiles update from database")
            const profilesData = snapshot.val() || {}
            console.log("10. Raw profiles data:", profilesData)
            
            const profilesList: Profile[] = Object.entries(profilesData).map(([id, data]: [string, any]) => ({
              id,
              ...data,
            }))
            
            console.log(`11. Processed ${profilesList.length} profiles`)
            callback(profilesList)
          } catch (error) {
            console.error("❌ Error processing profiles:", error)
            callback([])
          }
        },
        (error) => {
          console.error("❌ Error in profiles subscription:", error)
          callback([])
        }
      )

      // Update the unsubscribe function
      unsubscribe = () => {
        console.log("12. Unsubscribing from profiles...")
        try {
          off(profilesRef, 'value', unsubscribeFn)
          console.log("13. Successfully unsubscribed")
        } catch (err) {
          console.error("❌ Error in unsubscribe:", err)
        }
      }
      
      console.log("14. Subscription setup complete")
    } catch (error) {
      console.error("❌ Error in profiles subscription setup:", error)
      callback([])
    }
  }

  // Start the initialization
  console.log("15. Starting initialization...")
  init().catch(error => {
    console.error("❌ Unhandled error in init():", error)
    callback([])
  })

  // Return the cleanup function
  return () => {
    console.log("16. Cleanup function called")
    try {
      unsubscribe()
    } catch (error) {
      console.error("❌ Error in cleanup:", error)
    }
  }
}
