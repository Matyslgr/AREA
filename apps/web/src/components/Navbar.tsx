import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-6 md:p-10">
        <nav className="mx-auto max-w-4xl rounded-full bg-white px-6 py-3 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-800 ml-4">AREA</span>
                <div className="flex items-center gap-3">
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
            </div>
        </nav>
    </div>
  )
}
