import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"

export function SigninForm({
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

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate("/home")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
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
          <h1 className="text-2xl font-bold text-black">Sign in to your account</h1>
          <p className="text-muted-foreground text-sm text-balance text-black">
            Enter your email and password to sign in
          </p>
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="email" className="text-black">Email</FieldLabel>
          <Input
            className="text-black"
            id="email"
            type="email"
            placeholder="me@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password" className="text-black">Password</FieldLabel>
          <Input
            className="text-black"
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldDescription className="text-gray-500">
            <a href="" className="underline-offset-4 text-blue-600">Forgot password?</a>
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="w-full text-white shadow-md" style={{backgroundColor: '#6097FF'}}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Field>
        <div className="text-center text-sm text-gray-600">
          Don't have an account ?{" "}
          <Link to="/signup" className="underline underline-offset-4 text-blue-600">
            Sign up
          </Link>
        </div>
      </FieldGroup>
    </form>
  )
}
