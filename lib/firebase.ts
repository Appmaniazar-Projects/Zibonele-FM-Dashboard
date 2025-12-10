"use client"

// Check if we're in a browser environment and have Firebase config
const hasFirebaseConfig =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

// Firebase instances
let app: any = null
let db: any = null
let auth: any = null
let storage: any = null
let isInitialized = false
let initializationAttempted = false

// Initialize Firebase with Realtime Database
const initializeFirebase = async (forceReinit = false) => {
  // If already initialized and not forcing reinitialization, return current state
  if (isInitialized && !forceReinit) {
    return { success: true }
  }

  // Reset state if forcing reinitialization
  if (forceReinit) {
    app = null
    db = null
    auth = null
    storage = null
    isInitialized = false
    initializationAttempted = false
  }

  // Prevent multiple initialization attempts
  if (initializationAttempted && !forceReinit) {
    // Wait a bit to see if initialization completes
    await new Promise(resolve => setTimeout(resolve, 100))
    return { success: isInitialized }
  }

  initializationAttempted = true

  if (!hasFirebaseConfig) {
    console.log("🔧 No Firebase config found, using mock Firebase")
    return { success: false, reason: "no-config" }
  }

  try {
    console.log("🔥 Starting Firebase initialization...")

    // Import Firebase modules dynamically
    const { initializeApp } = await import("firebase/app")
    const { getAuth } = await import("firebase/auth")
    const { getDatabase } = await import("firebase/database")

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 
                  `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
    }

    // Initialize Firebase app if not already initialized
    if (!app) {
      console.log("🔥 Initializing Firebase app...")
      try {
        app = initializeApp(firebaseConfig)
        console.log("✅ Firebase app initialized")
      } catch (appError) {
        console.warn("⚠️ Could not initialize Firebase app:", appError)
        return { success: false, reason: "app-init-failed" }
      }
    }
    
    // Initialize Auth service
    if (!auth) {
      console.log("🔥 Initializing Auth...")
      try {
        auth = getAuth(app)
        console.log("✅ Firebase Auth initialized")
      } catch (authError) {
        console.warn("⚠️ Could not initialize Firebase Auth:", authError)
        // Continue even if auth fails
      }
    }
    
    // Initialize Realtime Database
    if (!db) {
      console.log("🔥 Initializing Realtime Database...")
      try {
        db = getDatabase(app)
        console.log("✅ Realtime Database initialized")
      } catch (dbError) {
        console.warn("⚠️ Could not initialize Realtime Database:", dbError)
        // Continue even if database fails
      }
    }
    
    isInitialized = true
    console.log("🎉 Firebase services ready")
    return { success: true }
  } catch (error: any) {
    console.error("❌ Firebase initialization failed:", error.message || error)
    console.error("🔧 Dashboard requires real Firebase connection")

    // Reset instances on failure
    app = null
    db = null
    auth = null
    storage = null
    isInitialized = false

    return { success: false, reason: "init-failed", error: error.message }
  }
}

// Mock Auth for fallback
const createMockAuth = () => ({
  currentUser: null as any,

  signInWithEmailAndPassword: async (email: string, password: string) => {
    console.log("🔧 Mock Auth: Sign in with email:", email)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = {
      email,
      displayName: email.split("@")[0],
      uid: `mock-${Date.now()}`,
      emailVerified: true,
    }

    mockAuth.currentUser = user
    if (mockAuth._authStateCallback) {
      mockAuth._authStateCallback(user)
    }
    return { user }
  },

  signOut: async () => {
    console.log("🔧 Mock Auth: Sign out")
    await new Promise((resolve) => setTimeout(resolve, 500))

    mockAuth.currentUser = null
    if (mockAuth._authStateCallback) {
      mockAuth._authStateCallback(null)
    }
  },

  onAuthStateChanged: (callback: any) => {
    mockAuth._authStateCallback = callback
    setTimeout(() => callback(mockAuth.currentUser), 100)
    return () => {
      mockAuth._authStateCallback = null
    }
  },

  _authStateCallback: null as any,
})

// Create mock instance
const mockAuth = createMockAuth()

// Helper function to get Firebase instances
// Cache the promise to prevent multiple simultaneous initializations
let initializationPromise: Promise<any> | null = null

export const getFirebaseInstances = async () => {
  try {
    // If already initialized, return immediately
    if (isInitialized && app && (auth || db)) {
      return {
        db: db,
        auth: auth || mockAuth,
        storage: storage,
        isUsingRealFirebase: !!auth,
        isUsingRealDatabase: !!db,
      }
    }

    // If initialization is in progress, wait for it
    if (initializationPromise) {
      await initializationPromise
      return {
        db: db,
        auth: auth || mockAuth,
        storage: storage,
        isUsingRealFirebase: !!auth,
        isUsingRealDatabase: !!db,
      }
    }

    // Start initialization
    initializationPromise = initializeFirebase().then((result) => {
      initializationPromise = null
      if (!result.success) {
        console.warn("⚠️ Firebase initialization had issues but continuing with available services")
      }
      return result
    })

    await initializationPromise

    // Return whatever instances we have, even if initialization wasn't fully successful
    return {
      db: db,
      auth: auth || mockAuth,
      storage: storage,
      isUsingRealFirebase: !!auth,
      isUsingRealDatabase: !!db,
    }
  } catch (error) {
    initializationPromise = null
    console.warn("⚠️ Continuing with limited functionality:", error)
    // Return mock auth and null db when there's an error
    return {
      db: null,
      auth: mockAuth,
      storage: null,
      isUsingRealFirebase: false,
      isUsingRealDatabase: false,
    }
  }
}

// Export static instances
export { app }
export const firebaseAuth = auth || mockAuth // Export for compatibility
export const firebaseStorage = null

// Utility functions
export const serverTimestamp = () => Date.now()

console.log("🚀 Firebase module loaded - Staff Dashboard with Realtime Database")
