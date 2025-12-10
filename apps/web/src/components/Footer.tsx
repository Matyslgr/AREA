export default function Footer() {
  return (
    <footer className="bg-[#2B3E8F] py-16 px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex-1 max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-[#A3B8FF]">AREA</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Automate your workflow by connecting your favorite apps and services.
              Create powerful integrations to save time and boost productivity.
            </p>
            <p className="text-gray-500 text-sm">© 2025 AREA. All rights reserved.</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
              <a href="/services/youtube" className="text-gray-300 hover:text-[#A3B8FF] text-sm transition-colors">
                YouTube
              </a>
              <a href="/services/discord" className="text-gray-300 hover:text-[#A3B8FF] text-sm transition-colors">
                Discord
              </a>
              <a href="/services/gmail" className="text-gray-300 hover:text-[#A3B8FF] text-sm transition-colors">
                Gmail
              </a>
              <a href="/services/notion" className="text-gray-300 hover:text-[#A3B8FF] text-sm transition-colors">
                Notion
              </a>
              <a href="/services/linkedin" className="text-gray-300 hover:text-[#A3B8FF] text-sm transition-colors">
                LinkedIn
              </a>
              <a href="/services/github" className="text-gray-300 hover:text-[#A3B8FF] text-sm transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
