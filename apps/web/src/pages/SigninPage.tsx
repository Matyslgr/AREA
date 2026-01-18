import { Link, useNavigate } from "react-router-dom"
import { SigninForm } from "@/components/signin-form"
import { api } from "@/lib/api"
import { Zap } from "lucide-react"

export default function SigninPage() {
  const navigate = useNavigate()

  const handleOAuthSignin = async (provider: string) => {
    try {
      const source = 'web';

      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${provider}?mode=login&source=${source}&redirect=${encodeURIComponent(window.location.origin + "/auth/callback")}`
      )

      window.location.href = url
    } catch (err) {
      console.error(`Failed to start OAuth with ${provider}:`, err)
      navigate('/signin?error=oauth_init_failed', { replace: true })
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
            <SigninForm onOAuthSignin={handleOAuthSignin} />
          </div>
        </div>
        <div className="text-center text-xs text-zinc-600">
          Protected by industry-standard encryption
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
              Welcome Back
            </h2>
            <p className="text-lg text-black/70 leading-relaxed">
              Pick up right where you left off. Your automations are running
              and your workflows are ready.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-4 w-full">
            <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-black/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-black">24/7</span>
              <span className="text-xs text-black/60">Always Running</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-black/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-black">99.9%</span>
              <span className="text-xs text-black/60">Uptime</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-black/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-black">&lt;1s</span>
              <span className="text-xs text-black/60">Response</span>
            </div>
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
