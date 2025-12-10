import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { MyCarousel } from "@/components/MyCarousel"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Zap, ArrowRight, Sparkles, Link as LinkIcon, Clock } from "lucide-react"

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-zinc-300">Automate your digital life</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Connect Apps.
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Automate Everything.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Link your favorite services and create powerful automations
            that work around the clock. No coding required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold px-8 py-6 text-lg hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/25 transition-all"
              onClick={() => navigate("/signup")}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8 py-6 text-lg"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
              <LinkIcon className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-zinc-400">10+ Integrations</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-zinc-400">Real-time Triggers</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-zinc-400">Instant Actions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-900/50 border-y border-zinc-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Create powerful automations in three simple steps
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative p-8 rounded-2xl bg-zinc-900 border border-zinc-800 group hover:border-amber-500/30 transition-colors">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 mt-2">Choose a Trigger</h3>
              <p className="text-zinc-400">
                Select an event from any connected service that will start your automation.
              </p>
            </div>

            <div className="relative p-8 rounded-2xl bg-zinc-900 border border-zinc-800 group hover:border-amber-500/30 transition-colors">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 mt-2">Define an Action</h3>
              <p className="text-zinc-400">
                Choose what happens when your trigger fires. Send emails, post messages, and more.
              </p>
            </div>

            <div className="relative p-8 rounded-2xl bg-zinc-900 border border-zinc-800 group hover:border-amber-500/30 transition-colors">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 mt-2">Let It Run</h3>
              <p className="text-zinc-400">
                Your automation runs 24/7, handling tasks automatically while you focus on what matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powerful Integrations
            </h2>
            <p className="text-zinc-400 text-lg">
              Connect the tools you already use
            </p>
          </div>
          <MyCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-orange-500/10 border-t border-zinc-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to automate?
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
            Join thousands of users who save hours every week with AREA automations.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold px-10 py-6 text-lg hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/25"
            onClick={() => navigate("/signup")}
          >
            Start Free Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
