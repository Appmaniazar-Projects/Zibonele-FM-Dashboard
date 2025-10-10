"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Mic, Users, Settings, Plus, BarChart3, Database, Wifi } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useEffect, useState } from "react"
import { getShows, type Show } from "@/lib/firestore/shows"
import { getProfiles } from "@/lib/firestore/profiles"
import { getEvents } from "@/lib/firestore/events"
import { useAuth } from "@/components/auth/auth-provider"
import { FloatingActionButton } from "@/components/floating-action-button"

export default function Dashboard() {
  const { user, isUsingRealFirebase } = useAuth()
  const [stats, setStats] = useState({
    shows: 0,
    presenters: 0,
    events: 0,
    loading: true,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log("📊 Loading dashboard statistics...")
        const [shows, presenters, events] = await Promise.all([
          getShows().catch((e: Error) => { 
            console.error("Error fetching shows:", e); 
            return [] as Show[]; 
          }),
          getProfiles().catch((e: Error) => { 
            console.error("Error fetching profiles:", e); 
            return []; 
          }),
          getEvents().catch((e: Error) => { 
            console.error("Error fetching events:", e); 
            return []; 
          })
        ]);

        console.log("📊 Fetched data:", { shows, presenters, events });

        setStats({
          shows: Array.isArray(shows) ? shows.length : 0,
          presenters: presenters.length,
          events: events.length,
          loading: false,
        })

        console.log("✅ Dashboard stats loaded:", {
          shows: shows.length,
          presenters: presenters.length,
          events: events.length,
        })
      } catch (error) {
        console.error("❌ Error loading dashboard stats:", error)
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }

    loadStats()
  }, [])

  const quickActions = [
    {
      title: "Add New Show",
      description: "Create a new radio show",
      icon: Mic,
      href: "/shows",
      color: "bg-radio-gold/20 hover:bg-radio-gold/30 border-radio-gold/30",
      count: stats.shows,
    },
    {
      title: "Create Event",
      description: "Schedule a new event",
      icon: Calendar,
      href: "/events",
      color: "bg-radio-red/20 hover:bg-radio-red/30 border-radio-red/30",
      count: stats.events,
    },
    {
      title: "Add Presenter",
      description: "Create presenter profile",
      icon: Users,
      href: "/presenters",
      color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30",
      count: stats.presenters,
    },
    {
      title: "Station Settings",
      description: "Configure your station",
      icon: Settings,
      href: "/settings",
      color: "bg-green-500/20 hover:bg-green-500/30 border-green-500/30",
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={user?.displayName || user?.email?.split("@")[0] || "Staff"} />

        <div className="flex-1 p-6 bg-radio-gray">
          {/* Connection Status */}
          <div className="mb-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${isUsingRealFirebase ? "bg-green-500" : "bg-yellow-500"}`}
                    ></div>
                    <div>
                      <p className="font-medium">{isUsingRealFirebase ? "Connected to Firebase" : "Demo Mode"}</p>
                      <p className="text-sm text-white/70">
                        {isUsingRealFirebase ? "Real-time data sync active" : "Using mock data"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isUsingRealFirebase ? (
                      <Wifi className="h-5 w-5 text-green-500" />
                    ) : (
                      <Database className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Radio Management Dashboard</h2>
            <p className="text-white/70 text-lg">Manage shows, presenters, and events for your mobile app</p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Plus className="h-5 w-5 text-radio-gold mr-2" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card
                    className={`${action.color} border text-white cursor-pointer transition-all duration-200 hover:scale-105`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-between mb-3">
                        <action.icon className="h-8 w-8 text-white" />
                        {action.count !== undefined && (
                          <span className="text-2xl font-bold text-white">{stats.loading ? "..." : action.count}</span>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1">{action.title}</h4>
                      <p className="text-sm text-white/80">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Data Overview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 text-radio-gold mr-2" />
              Content Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Mic className="h-6 w-6 text-radio-gold" />
                    <span className="text-2xl font-bold text-radio-gold">{stats.loading ? "..." : stats.shows}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Radio Shows</CardTitle>
                  <CardDescription className="text-white/70">Active shows in your lineup</CardDescription>
                  <Link href="/shows">
                    <button className="mt-3 text-radio-gold hover:text-radio-gold/80 text-sm font-medium">
                      Manage Shows →
                    </button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Users className="h-6 w-6 text-radio-gold" />
                    <span className="text-2xl font-bold text-radio-gold">
                      {stats.loading ? "..." : stats.presenters}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Presenters</CardTitle>
                  <CardDescription className="text-white/70">Active presenter profiles</CardDescription>
                  <Link href="/presenters">
                    <button className="mt-3 text-radio-gold hover:text-radio-gold/80 text-sm font-medium">
                      Manage Presenters →
                    </button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Calendar className="h-6 w-6 text-radio-gold" />
                    <span className="text-2xl font-bold text-radio-gold">{stats.loading ? "..." : stats.events}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">Events</CardTitle>
                  <CardDescription className="text-white/70">Scheduled community events</CardDescription>
                  <Link href="/events">
                    <button className="mt-3 text-radio-gold hover:text-radio-gold/80 text-sm font-medium">
                      Manage Events →
                    </button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <FloatingActionButton onClick={() => console.log("Add new item")} />
      </div>
    </DashboardLayout>
  )
}
