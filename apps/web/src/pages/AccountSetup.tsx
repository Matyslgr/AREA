import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Check, Link as LinkIcon, ArrowRight, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

import GithubIcon from "@/assets/icons/github.png"
import GoogleIcon from "@/assets/icons/google.png"
import LinkedinIcon from "@/assets/icons/linkedin.png"
import NotionIcon from "@/assets/icons/notion.png"
import SpotifyIcon from "@/assets/icons/spotify.png"
import TwitchIcon from "@/assets/icons/twitch.png"

interface AccountDetails {
  id: string
  email: string
  username: string
  hasPassword: boolean
  linkedAccounts: Array<{
    id: string
    provider: string
    provider_account_id: string
  }>
}

const services = [
  { id: "google", name: "Google", icon: GoogleIcon },
  { id: "github", name: "GitHub", icon: GithubIcon },
  { id: "spotify", name: "Spotify", icon: SpotifyIcon },
  { id: "notion", name: "Notion", icon: NotionIcon },
  { id: "linkedin", name: "LinkedIn", icon: LinkedinIcon },
  { id: "twitch", name: "Twitch", icon: TwitchIcon },
]

export default function AccountSetup() {
  const navigate = useNavigate()
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('area-token')
    if (!token) {
      navigate("/signin")
      return
    }

    const fetchAccountDetails = async () => {
      try {
        const details = await api.get<AccountDetails>("/auth/account")
        console.log("Account details:", details)
        setAccountDetails(details)
      } catch (err) {
        console.error("Failed to fetch account details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccountDetails()
  }, [navigate])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await api.post("/auth/account/password", { password })
      const details = await api.get<AccountDetails>("/auth/account")
      setAccountDetails(details)
      setPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password")
    }
  }

  const handleLinkService = async (provider: string) => {
    try {
      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${provider}?mode=connect&redirect=${encodeURIComponent(window.location.origin + "/auth/callback")}`
      )

      window.location.href = url
    } catch (err) {
      console.error(`Failed to link ${provider}:`, err)
    }
  }

  const isServiceLinked = (provider: string) => {
    if (!accountDetails || !accountDetails.linkedAccounts) return false
    return accountDetails.linkedAccounts.some(
      (account) => account.provider.toLowerCase() === provider.toLowerCase()
    )
  }

  const handleContinue = () => {
    navigate("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Set Up Your Account</h1>
            <p className="text-zinc-400">
              Connect your services to start automating your workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Password Section */}
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {accountDetails?.hasPassword ? (
                    <>
                      <Check className="h-5 w-5 text-green-400" />
                      Password Set
                    </>
                  ) : (
                    "Set Your Password"
                  )}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {accountDetails?.hasPassword
                    ? "Your account is secured with a password"
                    : "Create a password to secure your account"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accountDetails?.hasPassword ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">
                      You can sign in using your email and password
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                        <AlertCircle className="h-5 w-5" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-zinc-200">Password</Label>
                      <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-zinc-200">Confirm Password</Label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium hover:from-amber-500 hover:to-orange-600"
                    >
                      Set Password
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Services Section */}
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-amber-400" />
                  Link Your Services
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Connect accounts to use them in your automations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((service) => {
                    const linked = isServiceLinked(service.id)
                    return (
                      <button
                        key={service.id}
                        onClick={() => !linked && handleLinkService(service.id)}
                        disabled={linked}
                        className={`relative p-4 rounded-lg border-2 transition-all ${
                          linked
                            ? "border-green-500/50 bg-green-500/10"
                            : "border-zinc-700 hover:border-amber-500/50 bg-zinc-800 hover:scale-105"
                        }`}
                      >
                        <img
                          src={service.icon}
                          alt={service.name}
                          className="h-10 w-10 mx-auto mb-2"
                        />
                        <p className="text-sm font-medium text-zinc-200">{service.name}</p>
                        {linked && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-4 w-4 text-green-400" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-zinc-500 mt-4 text-center">
                  You can link more accounts anytime in settings
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold px-8 hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
            >
              Continue to Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
