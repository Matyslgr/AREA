import { SigninForm } from "@/components/signin-form"
import Navbar from "@/components/Navbar"
import "./SigninPage.css"

import GithubIcon from "@/assets/signup-icons/github.png"
import GoogleIcon from "@/assets/signup-icons/google.png"
import LinkedinIcon from "@/assets/signup-icons/linkedin.png"
import NotionIcon from "@/assets/signup-icons/notion.png"
import SpotifyIcon from "@/assets/signup-icons/spotify.png"
import TwitchIcon from "@/assets/signup-icons/twitch.png"
import { api } from "@/lib/api"

export default function SigninPage() {
  const handleOAuthSignin = async (provider: string) => {
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
    <div className="signin-container">
      <Navbar />

      <div className="signin-main-section">
        <div className="signin-form-wrapper">
          <div className="signin-form-content">
            <SigninForm />
          </div>

          <div className="signin-separator"></div>

          <div className="signin-services-section">
            <div className="signin-services-wrapper">
              <h3 className="signin-services-title">Or sign in with</h3>
              <div className="signin-services-content">
                <button className="service-button service-button-google" onClick={() => handleOAuthSignin("google")}>
                  <img src={GoogleIcon} alt="Google" className="service-icon" />
                  Google
                </button>
                <button className="service-button service-button-github" onClick={() => handleOAuthSignin("github")}>
                  <img src={GithubIcon} alt="Github" className="service-icon" />
                  Github
                </button>
                <button className="service-button service-button-spotify" onClick={() => handleOAuthSignin("spotify")}>
                  <img src={SpotifyIcon} alt="Spotify" className="service-icon" />
                  Spotify
                </button>
                <button className="service-button service-button-notion" onClick={() => handleOAuthSignin("notion")}>
                  <img src={NotionIcon} alt="Notion" className="service-icon" />
                  Notion
                </button>
                <button className="service-button service-button-linkedin" onClick={() => handleOAuthSignin("linkedin")}>
                  <img src={LinkedinIcon} alt="LinkedIn" className="service-icon" />
                  LinkedIn
                </button>
                <button className="service-button service-button-twitch" onClick={() => handleOAuthSignin("twitch")}>
                  <img src={TwitchIcon} alt="Twitch" className="service-icon" />
                  Twitch
                </button>
              </div>
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
