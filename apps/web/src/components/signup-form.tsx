import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const success = await signup("caca", email, password)
      if (success) {
        navigate("/home")
      } else {
        setError("Email already exists")
      }
    } catch (err) {
      setError(`An error occurred during signup. Please try again. ${err}`)
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
          <h1 className="text-2xl font-bold text-black">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance text-black">
            Fill in the form below to create your account
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
          <FieldDescription className="text-gray-500 -mt-1">
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password" className="text-black">Confirm Password</FieldLabel>
          <Input
            className="text-black"
            id="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <FieldDescription className="text-gray-500 -mt-1">
            Please confirm your password.
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="w-full text-white shadow-md" style={{backgroundColor: '#6097FF'}}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </Field>
        <div className="text-center text-sm text-gray-600">
          Already have an account ?{" "}
          <Link to="/signin" className="underline underline-offset-4 text-blue-600">
            Sign in
          </Link>
        </div>
      </FieldGroup>
    </form>
  )
}
