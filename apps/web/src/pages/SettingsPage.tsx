import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Link as LinkIcon, Unlink, Check, Eye, EyeOff, Loader, X } from "lucide-react"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"

import GoogleIcon from "@/assets/icons/google.png"
import SpotifyIcon from "@/assets/icons/spotify.png"
import GithubIcon from "@/assets/icons/github.png"
import NotionIcon from "@/assets/icons/notion.png"
import LinkedinIcon from "@/assets/icons/linkedin.png"
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

const SERVICES = [
  { id: "google", name: "Google", icon: GoogleIcon },
  { id: "github", name: "GitHub", icon: GithubIcon },
  { id: "spotify", name: "Spotify", icon: SpotifyIcon },
  { id: "notion", name: "Notion", icon: NotionIcon },
  { id: "linkedin", name: "LinkedIn", icon: LinkedinIcon },
  { id: "twitch", name: "Twitch", icon: TwitchIcon },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [username, setUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [unlinkingService, setUnlinkingService] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    accountId: string
    serviceName: string
  }>({
    show: false,
    accountId: "",
    serviceName: ""
  })

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return
    }

    if (!isAuthenticated) {
      navigate("/signin")
      return
    }

    // Check for error/success in URL params
    const errorParam = searchParams.get("error")
    const successParam = searchParams.get("success")

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      // Clean URL by removing error param
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("error")
      setSearchParams(newParams, { replace: true })
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }

    if (successParam) {
      setSuccess(decodeURIComponent(successParam))
      // Clean URL by removing success param
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("success")
      setSearchParams(newParams, { replace: true })
      // Auto-hide success after 3 seconds
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }

    fetchAccountDetails()
  }, [isAuthenticated, authLoading])

  const fetchAccountDetails = async () => {
    try {
      setLoading(true)
      const details = await api.get<AccountDetails>("/auth/account")
      setAccountDetails(details)
      setUsername(details.username)
    } catch (err) {
      setError("Failed to load account details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty")
      return
    }

    try {
      setSavingProfile(true)
      setError("")
      setSuccess("")

      await api.patch("/auth/account", { username })
      setSuccess("Username updated successfully")

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update username")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    try {
      setSavingPassword(true)
      setError("")
      setSuccess("")

      await api.post("/auth/account/password", { password: newPassword })
      setSuccess("Password updated successfully")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLinkService = async (serviceId: string) => {
    try {
      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${serviceId}?mode=connect&redirect=${encodeURIComponent(window.location.origin + "/settings")}`
      )
      window.location.href = url
    } catch (err) {
      setError(`Failed to link ${serviceId}`)
      console.error(err)
    }
  }

  const handleUnlinkService = (accountId: string, serviceName: string) => {
    setConfirmModal({
      show: true,
      accountId,
      serviceName
    })
  }

  const handleConfirmUnlink = async () => {
    const { accountId, serviceName } = confirmModal
    setConfirmModal({ show: false, accountId: "", serviceName: "", accountIdentifier: "" })

    try {
      setUnlinkingService(accountId)
      setError("")
      setSuccess("")

      await api.delete(`/auth/account/${accountId}`)
      setSuccess(`${serviceName} unlinked successfully`)

      await fetchAccountDetails()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to unlink ${serviceName}`)
    } finally {
      setUnlinkingService(null)
    }
  }

  const handleCancelUnlink = () => {
    setConfirmModal({ show: false, accountId: "", serviceName: "" })
  }

  const isServiceLinked = (serviceId: string) => {
    return accountDetails?.linkedAccounts.some(acc => acc.provider.toLowerCase() === serviceId.toLowerCase())
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-amber-400" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16 max-w-2xl">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-300 transition-colors"
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 flex items-center justify-between gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
            <button
              onClick={() => setSuccess("")}
              className="text-green-400 hover:text-green-300 transition-colors"
              aria-label="Close success"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Profile Section */}
        <Card className="mb-6 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
            <CardDescription className="text-zinc-400">Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-200">Email</Label>
              <Input
                type="email"
                value={accountDetails?.email || ""}
                disabled
                className="bg-zinc-800 border-zinc-700 text-zinc-400 cursor-not-allowed"
              />
              <p className="text-xs text-zinc-500">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-200">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
              />
            </div>

            <Button
              onClick={handleUpdateUsername}
              disabled={savingProfile || username === accountDetails?.username}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium"
            >
              {savingProfile ? "Saving..." : "Update Username"}
            </Button>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card className="mb-6 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Password</CardTitle>
            <CardDescription className="text-zinc-400">Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-zinc-200">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-200">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
              />
            </div>

            <Button
              onClick={handleUpdatePassword}
              disabled={savingPassword || !newPassword || !confirmPassword}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium"
            >
              {savingPassword ? "Saving..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Connected Services Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Connected Services</CardTitle>
            <CardDescription className="text-zinc-400">Link or unlink your OAuth accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICES.map((service) => {
                const linked = isServiceLinked(service.id)
                const linkedAccount = accountDetails?.linkedAccounts.find(
                  acc => acc.provider.toLowerCase() === service.id.toLowerCase()
                )

                return (
                  <div
                    key={service.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      linked
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={service.icon} alt={service.name} className="h-8 w-8 rounded" />
                      <div>
                        <p className="font-semibold text-white">{service.name}</p>
                        {linked && (
                          <p className="text-xs text-green-400">Connected</p>
                        )}
                      </div>
                    </div>

                    {linked && linkedAccount ? (
                      <Button
                        onClick={() => handleUnlinkService(linkedAccount.id, service.name)}
                        disabled={unlinkingService === linkedAccount.id}
                        variant="outline"
                        size="sm"
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        {unlinkingService === linkedAccount.id ? "Unlinking..." : "Unlink"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleLinkService(service.id)}
                        variant="outline"
                        size="sm"
                        className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Link Account
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unlink Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-900 border-zinc-800 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-white">Confirm Unlinking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-300">Are you sure you want to unlink <span className="font-semibold text-white">{confirmModal.serviceName}</span>?</p>

              <p className="text-sm text-amber-400/70">⚠️ This action cannot be undone. You will need to link your account again to use this service.</p>

              <div className="flex gap-3">
                <Button
                  onClick={handleCancelUnlink}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUnlink}
                  disabled={unlinkingService === confirmModal.accountId}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {unlinkingService === confirmModal.accountId ? "Unlinking..." : "Unlink"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
