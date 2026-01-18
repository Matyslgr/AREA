import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GoogleLoginButton } from "./GoogleLoginButton"
import { GithubLoginButton } from "./GithubLoginButton"
import { SpotifyLoginButton } from "./SpotifyLoginButton"
import { TwitchLoginButton } from "./TwitchLoginButton"
import { NotionLoginButton } from "./NotionLoginButton"
import { LinkedinLoginButton } from "./LinkedinLoginButton"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate("/home")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError(`An error occurred during login. Please try again. ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              to="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {/* Bouton de Login Classique */}
        <Field>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white hover:from-yellow-500 hover:via-amber-600 hover:to-orange-700 shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Field>

        {/* Séparateur */}
        <FieldSeparator>Or continue with</FieldSeparator>

        {/* Section OAuth */}
        <div className="flex flex-col gap-2 w-full">
          <GoogleLoginButton />
          <GithubLoginButton />
          <SpotifyLoginButton />
          <TwitchLoginButton />
          <NotionLoginButton />
          <LinkedinLoginButton />
        </div>

        {/* Lien vers l'inscription */}
        <FieldDescription className="text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </FieldDescription>

      </FieldGroup>
    </form>
  )
}