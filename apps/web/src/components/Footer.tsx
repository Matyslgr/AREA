import { Link } from "react-router-dom"
import { Zap } from "lucide-react"

const serviceIcons: Record<string, string> = {
  google: "/assets/google.png",
  linkedin: "/assets/linkedin.png",
  github: "/assets/github.png",
  notion: "/assets/notion.png",
  spotify: "/assets/spotify.png",
  twitch: "/assets/twitch.png",
};

const services = ["google", "linkedin", "github", "notion", "spotify", "twitch"];

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand Section */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <Zap className="size-4 text-black" />
              </div>
              <span className="text-xl font-semibold text-white">AREA</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Automate your workflow by connecting your favorite apps and services.
              Create powerful integrations to save time and boost productivity.
            </p>
            <p className="text-zinc-600 text-sm">© 2025 AREA. All rights reserved.</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Integrations
            </h4>
            <div className="flex gap-4 flex-wrap">
              {services.map((service) => (
                <div
                  key={service}
                  className="h-10 w-10 rounded-lg bg-white border border-zinc-700 flex items-center justify-center hover:border-amber-400 transition-colors"
                  title={service.charAt(0).toUpperCase() + service.slice(1)}
                >
                  <img
                    src={serviceIcons[service] || "/assets/default.png"}
                    alt={service}
                    className="h-5 w-5 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-sm">
            <Link to="/terms" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Privacy
            </Link>
          </div>
          <div className="text-zinc-600 text-sm">
            Built with passion for automation
          </div>
        </div>
      </div>
    </footer>
  )
}
