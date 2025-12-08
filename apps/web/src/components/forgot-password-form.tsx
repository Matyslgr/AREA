import { useState } from "react"
import { Link } from "react-router-dom"
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

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const [email, setEmail] = useState("")
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess(false)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess(true)
                setEmail("")
            } else {
                setError(data.error || "An error occurred. Please try again.")
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
                    <h1 className="text-2xl font-bold">Forgot your password?</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Enter your email address and we'll send you a link to reset your
                        password
                    </p>
                </div>

                {success && (
                    <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                        If the email exists, a password reset link has been sent. Please
                        check your inbox.
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
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 text-white hover:from-yellow-500 hover:via-amber-600 hover:to-orange-700 shadow-md"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </Field>
                    </>
                )}

                <FieldDescription className="text-center mt-4">
                    Remember your password?{" "}
                    <Link to="/signin" className="underline underline-offset-4">
                        Back to Login
                    </Link>
                </FieldDescription>
            </FieldGroup>
        </form>
    )
}
