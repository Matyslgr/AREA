import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"

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
    <div className="min-h-screen bg-gradient-to-br from-[#91B7FF] to-[#7BA5FF] flex items-center justify-center p-4">
      <Navbar />
      <Card className="w-full max-w-md shadow-xl border-0 bg-white pt-28 relative">
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-[#6097FF]" />
        </div>
        <CardHeader className="text-center space-y-2 mt-8">
          <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password?</CardTitle>
          <CardDescription className="text-gray-600">
            No worries, we'll send you reset instructions
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Check your email
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder
                </p>
              </div>
              <Link to="/signin">
                <Button variant="outline" className="w-full mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-gray-900"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6097FF] hover:bg-[#5087EF] text-white font-semibold shadow-md"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Link to="/signin">
                <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
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
