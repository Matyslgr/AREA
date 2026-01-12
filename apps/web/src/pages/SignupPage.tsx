import { Link, useNavigate } from "react-router-dom"
import { SignupForm } from "@/components/signup-form"
import { api } from "@/lib/api"
import { Zap } from "lucide-react"

export default function SignupPage() {
  const navigate = useNavigate()

  const handleOAuthSignup = async (provider: string) => {
    try {
      let scope = ""

      switch (provider) {
        case "google":
          scope = "https://www.googleapis.com/auth/gmail.send"
          break
        case "github":
          scope = "repo,user"
          break
        case "spotify":
          scope = "user-read-email user-read-private"
          break
        case "notion":
          scope = ""
          break
        case "linkedin":
          scope = "openid profile email"
          break
        case "twitch":
          scope = "user:read:email"
          break
      }

      const encodedScope = encodeURIComponent(scope)
      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${provider}?scope=${encodedScope}&mode=login&redirect=${encodeURIComponent(window.location.origin + "/auth/callback")}`
      )

      window.location.href = url
    } catch (err) {
      console.error(`Failed to start OAuth with ${provider}:`, err)
      navigate('/signup?error=oauth_init_failed', { replace: true })
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col bg-zinc-950 p-6 md:p-10">
        <div className="flex justify-start">
          <Link to="/" className="flex items-center gap-2.5 font-medium text-white">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
              <Zap className="size-4 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-tight">AREA</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <SignupForm onOAuthSignup={handleOAuthSignup} />
          </div>
        </div>
        <div className="text-center text-xs text-zinc-600">
          By signing up, you agree to our{" "}
          <Link to="/terms" className="text-zinc-400 hover:text-amber-400 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-zinc-400 hover:text-amber-400 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* Right side - Gradient visual */}
      <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-yellow-300/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-orange-600/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-full blur-2xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 p-12 text-center max-w-lg">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-black/10 backdrop-blur-sm">
            <Zap className="size-10 text-black/80" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-black">
              Automate Everything
            </h2>
            <p className="text-lg text-black/70 leading-relaxed">
              Connect your favorite apps and automate workflows in minutes.
              Build powerful integrations without writing a single line of code.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <span className="px-4 py-2 rounded-full bg-black/10 backdrop-blur-sm text-sm font-medium text-black/80">
              100+ Integrations
            </span>
            <span className="px-4 py-2 rounded-full bg-black/10 backdrop-blur-sm text-sm font-medium text-black/80">
              No-code Builder
            </span>
            <span className="px-4 py-2 rounded-full bg-black/10 backdrop-blur-sm text-sm font-medium text-black/80">
              Real-time Sync
            </span>
          </div>
        </div>

        {/* Floating nodes decoration */}
        <div className="absolute top-20 left-20 w-3 h-3 rounded-full bg-black/20" />
        <div className="absolute top-32 right-32 w-2 h-2 rounded-full bg-black/15" />
        <div className="absolute bottom-40 left-40 w-4 h-4 rounded-full bg-black/10" />
        <div className="absolute bottom-20 right-20 w-2.5 h-2.5 rounded-full bg-black/20" />
      </div>
    </div>
  )
}
