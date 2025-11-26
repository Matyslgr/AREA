import { GalleryVerticalEnd } from "lucide-react"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            AREA
          </div>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 dark:from-yellow-500 dark:via-yellow-600 dark:to-amber-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCAzLjk5OC00QzQyLjIwOSAzMCA0NCAzMS43OSA0NCAzNGMwIDIuMjEtMS43OSA0LTQuMDAyIDRDMzcuNzg5IDM4IDM2IDM2LjIxIDM2IDM0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 dark:opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="space-y-6 text-center text-white">
            <h2 className="text-4xl font-bold drop-shadow-lg">
              Join AREA Today
            </h2>
            <p className="text-lg drop-shadow-md opacity-90">
              Start automating your tasks and boost your productivity with our
              powerful platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
