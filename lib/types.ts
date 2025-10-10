export interface Show {
  id?: string
  title: string
  description: string
  presenter: string
  timeSlot: string
  day: string
  genre: string
  isActive: boolean
  createdAt?: any
  updatedAt?: any
}

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

export interface PresenterProfile {
  id?: string
  name: string
  bio: string
  profileImage?: string
  specialties: string[]
  socialMedia: {
    facebook?: string
    twitter?: string
    instagram?: string
  }
  isActive: boolean
  createdAt?: any
  updatedAt?: any
}
