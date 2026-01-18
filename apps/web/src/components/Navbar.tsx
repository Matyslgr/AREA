import { Button } from "@/components/ui/button"
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, Zap, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMenuOpen(false)
  }

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // Check if we're on auth pages (signin/signup) to hide navbar
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup'
  const isDashboardPage = location.pathname === '/dashboard'
  if (isAuthPage) return null

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
        <nav className="mx-auto max-w-5xl rounded-2xl bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 px-6 py-3 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 font-medium text-white hover:opacity-80 transition-opacity"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <Zap className="size-4 text-black" />
              </div>
              <span className="text-lg font-semibold tracking-tight">AREA</span>
            </button>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {!isDashboardPage && (
                    <Button
                      variant="ghost"
                      className="text-zinc-300 hover:text-white hover:bg-zinc-800"
                      onClick={() => navigate("/dashboard")}
                    >
                      Dashboard
                    </Button>
                  )}
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
                    onClick={() => navigate("/areas/create")}
                  >
                    Create AREA
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={() => navigate("/settings")}
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-zinc-300 hover:text-white hover:bg-zinc-800"
                    onClick={() => navigate("/signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
                    onClick={() => navigate("/signup")}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        <div className={`absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 transition-all duration-300 ease-out ${
          isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}>
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                {!isDashboardPage && (
                  <Button
                    variant="ghost"
                    className="justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 py-6"
                    onClick={() => {
                      navigate("/dashboard")
                      setIsMenuOpen(false)
                    }}
                  >
                    Dashboard
                  </Button>
                )}
                <Button
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium hover:from-amber-500 hover:to-orange-600 py-6"
                  onClick={() => {
                    navigate("/areas/create")
                    setIsMenuOpen(false)
                  }}
                >
                  Create AREA
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 py-6"
                  onClick={() => {
                    navigate("/settings")
                    setIsMenuOpen(false)
                  }}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 py-6"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="justify-start text-zinc-300 hover:text-white hover:bg-zinc-800 py-6"
                  onClick={() => {
                    navigate("/signin")
                    setIsMenuOpen(false)
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium hover:from-amber-500 hover:to-orange-600 py-6"
                  onClick={() => {
                    navigate("/signup")
                    setIsMenuOpen(false)
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
