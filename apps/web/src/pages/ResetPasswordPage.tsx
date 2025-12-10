import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Zap } from "lucide-react"
import { api } from "@/lib/api"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (!token) {
      setError("Invalid reset token")
      return
    }

    setLoading(true)

    try {
      await api.post("/auth/reset-password", { token, password })
      setSuccess(true)
      setTimeout(() => {
        navigate("/signin")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
            <Zap className="size-4 text-black" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AREA</span>
        </Link>

        <Card className="relative w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Invalid Reset Link</CardTitle>
            <CardDescription className="text-zinc-400">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/forgot-password">
              <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600">
                Request New Reset Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
          <Zap className="size-4 text-black" />
        </div>
        <span className="text-lg font-semibold tracking-tight">AREA</span>
      </Link>

      <Card className="relative w-full max-w-md bg-zinc-900 border-zinc-800 shadow-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto bg-amber-500/20 w-16 h-16 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Reset Your Password</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your new password below
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          {success ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Password Reset Successful!
                </h3>
                <p className="text-sm text-zinc-400">
                  Redirecting you to login...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-200">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500">Must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-200">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center text-sm text-zinc-400 pt-2">
                Remember your password?{" "}
                <Link to="/signin" className="text-amber-400 hover:text-amber-300 transition-colors">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
