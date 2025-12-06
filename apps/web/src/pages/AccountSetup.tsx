import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import { api } from "@/lib/api"
import "./AccountSetup.css"

import GithubIcon from "@/assets/signup-icons/github.png"
import GoogleIcon from "@/assets/signup-icons/google.png"
import LinkedinIcon from "@/assets/signup-icons/linkedin.png"
import NotionIcon from "@/assets/signup-icons/notion.png"
import SpotifyIcon from "@/assets/signup-icons/spotify.png"
import TwitchIcon from "@/assets/signup-icons/twitch.png"

interface AccountDetails {
  id: string
  email: string
  username: string
  hasPassword: boolean
  linkedAccounts: Array<{
    id: string
    provider: string
    provider_account_id: string
  }>
}

export default function AccountSetup() {
  const navigate = useNavigate()
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check token instead of user to allow OAuth redirect
    const token = localStorage.getItem('area-token')
    if (!token) {
      navigate("/signin")
      return
    }

    const fetchAccountDetails = async () => {
      try {
        const details = await api.get<AccountDetails>("/auth/account")
        console.log("Account details:", details)
        setAccountDetails(details)
      } catch (err) {
        console.error("Failed to fetch account details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAccountDetails()
  }, [navigate])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await api.post("/auth/account/password", { password })
      // Refresh account details
      const details = await api.get<AccountDetails>("/auth/account")
      setAccountDetails(details)
      setPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Failed to set password")
    }
  }

  const handleLinkService = async (provider: string) => {
    try {
      let scope = ""

      switch (provider) {
        case "google":
          scope = "https://www.googleapis.com/auth/gmail.send"
          break
        case "github":
          scope = "repo,user"
          break
        case "spotify":
          scope = "user-read-email,user-read-private"
          break
        case "notion":
          scope = ""
          break
        case "linkedin":
          scope = "r_liteprofile,r_emailaddress"
          break
        case "twitch":
          scope = "user:read:email"
          break
      }

      const encodedScope = encodeURIComponent(scope)
      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${provider}?scope=${encodedScope}&mode=connect`
      )

      window.location.href = url
    } catch (err) {
      console.error(`Failed to link ${provider}:`, err)
    }
  }

  const isServiceLinked = (provider: string) => {
    if (!accountDetails) return false
    return accountDetails.linkedAccounts.some(
      (account) => account.provider.toLowerCase() === provider.toLowerCase()
    )
  }

  const handleContinue = () => {
    navigate("/dashboard")
  }

  if (loading) {
    return (
      <div className="account-setup-container">
        <Navbar />
        <div className="account-setup-loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="account-setup-container">
      <Navbar />

      <div className="account-setup-main-section">
        <div className="account-setup-wrapper">
          <div className="account-setup-left-section">
            {accountDetails?.hasPassword ? (
              <div className="account-setup-text-content">
                <h2 className="account-setup-title">Accounts</h2>
                <p className="account-setup-subtitle">
                  Connect your different accounts to take full advantage of all available services
                </p>
              </div>
            ) : (
              <div className="account-setup-form-content">
                <h2 className="account-setup-form-title">Set up your password</h2>
                <p className="account-setup-form-subtitle">
                  Create a password to secure your account
                </p>
                <form onSubmit={handlePasswordSubmit} className="password-form">
                  {error && <div className="form-error">{error}</div>}

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input text-black"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input text-black"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>

                  <button type="submit" className="password-submit-btn">
                    Set Password
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="account-setup-separator"></div>

          <div className="account-setup-right-section">
            <div className="account-setup-services-wrapper">
              <h3 className="account-setup-services-title">Link your services</h3>
              <div className="account-setup-services-content">
                <button
                  className="service-link-button service-button-google"
                  onClick={() => handleLinkService("google")}
                  disabled={isServiceLinked("google")}
                >
                  <img src={GoogleIcon} alt="Google" className="service-icon" />
                  {isServiceLinked("google") ? "Google Linked" : "Link Google"}
                </button>
                <button
                  className="service-link-button service-button-github"
                  onClick={() => handleLinkService("github")}
                  disabled={isServiceLinked("github")}
                >
                  <img src={GithubIcon} alt="Github" className="service-icon" />
                  {isServiceLinked("github") ? "Github Linked" : "Link Github"}
                </button>
                <button
                  className="service-link-button service-button-spotify"
                  onClick={() => handleLinkService("spotify")}
                  disabled={isServiceLinked("spotify")}
                >
                  <img src={SpotifyIcon} alt="Spotify" className="service-icon" />
                  {isServiceLinked("spotify") ? "Spotify Linked" : "Link Spotify"}
                </button>
                <button
                  className="service-link-button service-button-notion"
                  onClick={() => handleLinkService("notion")}
                  disabled={isServiceLinked("notion")}
                >
                  <img src={NotionIcon} alt="Notion" className="service-icon" />
                  {isServiceLinked("notion") ? "Notion Linked" : "Link Notion"}
                </button>
                <button
                  className="service-link-button service-button-linkedin"
                  onClick={() => handleLinkService("linkedin")}
                  disabled={isServiceLinked("linkedin")}
                >
                  <img src={LinkedinIcon} alt="LinkedIn" className="service-icon" />
                  {isServiceLinked("linkedin") ? "LinkedIn Linked" : "Link LinkedIn"}
                </button>
                <button
                  className="service-link-button service-button-twitch"
                  onClick={() => handleLinkService("twitch")}
                  disabled={isServiceLinked("twitch")}
                >
                  <img src={TwitchIcon} alt="Twitch" className="service-icon" />
                  {isServiceLinked("twitch") ? "Twitch Linked" : "Link Twitch"}
                </button>
              </div>
              <p className="account-setup-services-footer">
                You can link your accounts later at any time in your Area account settings
              </p>
              <button onClick={handleContinue} className="continue-button">
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-left">
            <h3 className="footer-brand">AREA</h3>
            <p className="footer-tagline">
              Automate your workflow by connecting your favorite apps and services.
              Create powerful integrations to save time and boost productivity.
            </p>
            <p className="footer-copyright">© 2025 AREA. All rights reserved.</p>
          </div>

          <div className="footer-right">
            <h4 className="footer-services-title">Services</h4>
            <div className="footer-services-grid">
              <a href="/services/youtube" className="footer-service-link">YouTube</a>
              <a href="/services/discord" className="footer-service-link">Discord</a>
              <a href="/services/gmail" className="footer-service-link">Gmail</a>
              <a href="/services/notion" className="footer-service-link">Notion</a>
              <a href="/services/linkedin" className="footer-service-link">LinkedIn</a>
              <a href="/services/github" className="footer-service-link">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
