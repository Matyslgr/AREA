import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const API_URL = "http://localhost:8080"

export function ResetPasswordForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const navigate = useNavigate()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        if (!token) {
            setError("Invalid reset token")
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login")
                }, 2000)
            } else {
                setError(data.error || "An error occurred. Please try again.")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="flex flex-col gap-6">
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    Invalid or missing reset token. Please request a new password reset.
                </div>
                <Link to="/forgot-password">
                    <Button className="w-full">Request New Reset Link</Button>
                </Link>
            </div>
        )
    }

    return (
        <form
            className={cn("flex flex-col gap-6", className)}
            onSubmit={handleSubmit}
            {...props}
        >
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Reset your password</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your new password below
                    </p>
                </div>

                {success && (
                    <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                        Password has been reset successfully! Redirecting to login...
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {!success && (
                    <>
                        <Field>
                            <FieldLabel htmlFor="password">New Password</FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="confirmPassword">
                                Confirm Password
                            </FieldLabel>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Field>

                        <Field>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white hover:from-yellow-500 hover:via-amber-600 hover:to-orange-700 shadow-md"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </Field>
                    </>
                )}

                <FieldDescription className="text-center mt-4">
                    Remember your password?{" "}
                    <Link to="/login" className="underline underline-offset-4">
                        Back to Login
                    </Link>
                </FieldDescription>
            </FieldGroup>
        </form>
    )
}
