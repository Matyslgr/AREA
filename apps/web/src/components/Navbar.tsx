import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 p-6 md:p-10">
          <nav className="mx-auto max-w-4xl rounded-full bg-white px-6 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-800 ml-4">AREA</span>

                  {/* Desktop buttons */}
                  <div className="hidden md:flex items-center gap-3">
                    <Button
                        className="rounded-full bg-[#D4E3FE] px-5 py-2 text-sm text-gray-800 hover:bg-[#c4d3ee]"
                        onClick={() => navigate("/signin")}>
                        Sign In
                    </Button>
                    <Button
                        className="rounded-full bg-[#6097FF] px-5 py-2 text-sm text-white hover:bg-[#5087ef]"
                        onClick={() => navigate("/signup")}>
                        Sign Up
                    </Button>
                  </div>

                  {/* Mobile burger button */}
                  <button
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                  >
                    {isMenuOpen ? (
                      <X className="h-6 w-6 text-gray-800" />
                    ) : (
                      <Menu className="h-6 w-6 text-gray-800" />
                    )}
                  </button>
              </div>
          </nav>
      </div>

      {/* Mobile fullscreen menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu content */}
        <div className={`absolute top-32 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-3xl shadow-2xl p-8 transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-8'
        }`}>
          <div className="flex flex-col gap-4">
            <Button
                className="rounded-full bg-[#D4E3FE] px-6 py-6 text-base font-medium text-gray-800 hover:bg-[#c4d3ee] transition-all hover:scale-105"
                onClick={() => {
                  navigate("/signin")
                  setIsMenuOpen(false)
                }}>
                Sign In
            </Button>
            <Button
                className="rounded-full bg-[#6097FF] px-6 py-6 text-base font-medium text-white hover:bg-[#5087ef] transition-all hover:scale-105"
                onClick={() => {
                  navigate("/signup")
                  setIsMenuOpen(false)
                }}>
                Sign Up
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
