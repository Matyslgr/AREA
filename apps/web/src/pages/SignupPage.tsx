
import { SignupForm } from "@/components/signup-form"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import "./SignupPage.css"

import GithubIcon from "@/assets/icons/github.png"
import GoogleIcon from "@/assets/icons/google.png"
import LinkedinIcon from "@/assets/icons/linkedin.png"
import NotionIcon from "@/assets/icons/notion.png"
import SpotifyIcon from "@/assets/icons/spotify.png"
import TwitchIcon from "@/assets/icons/twitch.png"
import { api } from "@/lib/api"

export default function SignupPage() {
  const handleOAuthSignup = async (provider: string) => {
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
          scope = "user-read-email user-read-private"
          break
        case "notion":
          scope = ""
          break
        case "linkedin":
          scope = "openid profile email"
          break
        case "twitch":
          scope = "user:read:email"
          break
      }

      const encodedScope = encodeURIComponent(scope)
      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${provider}?scope=${encodedScope}&mode=login`
      )

      window.location.href = url
    } catch (err) {
      console.error(`Failed to start OAuth with ${provider}:`, err)
    }
  }

  return (
    <div className="signup-container">

      <Navbar />

      <div className="signup-main-section">
        <div className="signup-form-wrapper">
          <div className="signup-form-content">
            <SignupForm />
          </div>

          <div className="signup-separator"></div>

          <div className="signup-services-section">
            <div className="signup-services-wrapper">
              <h3 className="signup-services-title">Or create an account with</h3>
              <div className="signup-services-content">
                <button className="service-button service-button-google" onClick={() => handleOAuthSignup("google")}>
                  <img src={GoogleIcon} alt="Google" className="service-icon" />
                  Google
                </button>
                <button className="service-button service-button-github" onClick={() => handleOAuthSignup("github")}>
                  <img src={GithubIcon} alt="Github" className="service-icon" />
                  Github
                </button>
                <button className="service-button service-button-spotify" onClick={() => handleOAuthSignup("spotify")}>
                  <img src={SpotifyIcon} alt="Spotify" className="service-icon" />
                  Spotify
                </button>
                <button className="service-button service-button-notion" onClick={() => handleOAuthSignup("notion")}>
                  <img src={NotionIcon} alt="Notion" className="service-icon" />
                  Notion
                </button>
                <button className="service-button service-button-linkedin" onClick={() => handleOAuthSignup("linkedin")}>
                  <img src={LinkedinIcon} alt="LinkedIn" className="service-icon" />
                  LinkedIn
                </button>
                <button className="service-button service-button-twitch" onClick={() => handleOAuthSignup("twitch")}>
                  <img src={TwitchIcon} alt="Twitch" className="service-icon" />
                  Twitch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

    </div>
  )
}
