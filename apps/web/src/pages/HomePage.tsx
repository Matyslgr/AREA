import { GalleryVerticalEnd, LogOut, Zap, Link2, Bell, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="text-xl font-bold">AREA</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="border-b bg-gradient-to-br from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Welcome back, <span className="text-primary">{user?.name}</span>!
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              Your automation platform is ready. Create powerful workflows by
              connecting your favorite apps and services.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" className="gap-2">
                <Zap className="size-5" />
                Create Workflow
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Link2 className="size-5" />
                Connect Apps
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Your Dashboard</h2>
          <p className="text-muted-foreground">
            Manage and monitor your automation workflows
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Zap className="size-8 text-primary" />
                <span className="text-3xl font-bold">0</span>
              </div>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>
                Automations currently running
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View All
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Link2 className="size-8 text-primary" />
                <span className="text-3xl font-bold">0</span>
              </div>
              <CardTitle>Connected Apps</CardTitle>
              <CardDescription>
                Services linked to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Manage Apps
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Bell className="size-8 text-primary" />
                <span className="text-3xl font-bold">0</span>
              </div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Recent alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Alerts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Recent Activity</h2>
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <Clock className="size-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No activity yet</h3>
                  <p className="text-muted-foreground">
                    Start creating workflows to see your activity here
                  </p>
                </div>
                <Button className="mt-2">
                  <Zap className="mr-2 size-4" />
                  Create Your First Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
