"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Save, Upload, Bell, Shield, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col">
        <DashboardHeader title="Settings" />

        <div className="flex-1 p-6 bg-radio-gray">
          <div className="space-y-6">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-radio-gold" />
                  <span>Station Information</span>
                </CardTitle>
                <CardDescription className="text-white/70">
                  Update your radio station's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stationName">Station Name</Label>
                    <Input
                      id="stationName"
                      defaultValue="Zibonele Radio"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input id="frequency" defaultValue="98.2 FM" className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Station Description</Label>
                  <Textarea
                    id="description"
                    defaultValue="Community radio station serving the local area with music, news, and entertainment"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    defaultValue="123 Community Street, Local Area"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button className="bg-radio-gold text-radio-black hover:bg-radio-gold/90">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-radio-gold" />
                  <span>Logo & Branding</span>
                </CardTitle>
                <CardDescription className="text-white/70">Manage your station's visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo">Station Logo</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-radio-gold" />
                    </div>
                    <Button
                      variant="outline"
                      className="border-radio-gold text-radio-gold hover:bg-radio-gold hover:text-radio-black bg-transparent"
                    >
                      Upload New Logo
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-8 h-8 bg-radio-gold rounded border"></div>
                      <Input
                        id="primaryColor"
                        defaultValue="#d2a42a"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-8 h-8 bg-radio-black rounded border border-white/20"></div>
                      <Input
                        id="secondaryColor"
                        defaultValue="#2a2a2a"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-8 h-8 bg-radio-red rounded border"></div>
                      <Input
                        id="accentColor"
                        defaultValue="#ee1b22"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-radio-gold" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription className="text-white/70">Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-white/70">Receive updates via email</p>
                  </div>
                  <Switch id="emailNotifications" defaultChecked />
                </div>
                <Separator className="bg-white/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-white/70">Receive push notifications</p>
                  </div>
                  <Switch id="pushNotifications" defaultChecked />
                </div>
                <Separator className="bg-white/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showUpdates">Show Updates</Label>
                    <p className="text-sm text-white/70">Notify when shows are updated</p>
                  </div>
                  <Switch id="showUpdates" defaultChecked />
                </div>
                <Separator className="bg-white/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="eventUpdates">Event Updates</Label>
                    <p className="text-sm text-white/70">Notify when events are created or modified</p>
                  </div>
                  <Switch id="eventUpdates" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-radio-gold" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription className="text-white/70">Backup and restore your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-white/70">Automatically backup data daily</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-white/20" />
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="border-radio-gold text-radio-gold hover:bg-radio-gold hover:text-radio-black bg-transparent"
                  >
                    Export Data
                  </Button>
                  <Button
                    variant="outline"
                    className="border-radio-gold text-radio-gold hover:bg-radio-gold hover:text-radio-black bg-transparent"
                  >
                    Import Data
                  </Button>
                  <Button
                    variant="outline"
                    className="border-radio-red text-radio-red hover:bg-radio-red hover:text-white bg-transparent"
                  >
                    Reset All Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account / Logout */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
