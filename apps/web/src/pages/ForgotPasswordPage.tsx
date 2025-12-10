import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Zap } from "lucide-react"
import { api } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      await api.post("/auth/forgot-password", { email })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
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
            <Mail className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">Forgot Password?</CardTitle>
            <CardDescription className="text-zinc-400">
              No worries, we'll send you reset instructions
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
                  Check your email
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  We sent a password reset link to <span className="font-medium text-white">{email}</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Didn't receive the email? Check your spam folder
                </p>
              </div>
              <Link to="/signin">
                <Button variant="outline" className="w-full mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
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
                <Label htmlFor="email" className="text-zinc-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Link to="/signin">
                <Button variant="ghost" className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
