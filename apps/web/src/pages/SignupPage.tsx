
import { SignupForm } from "@/components/signup-form"

import Navbar from "@/components/Navbar"
import "./SignupPage.css"

import GithubIcon from "@/assets/signup-icons/github.png"
import GoogleIcon from "@/assets/signup-icons/google.png"
import LinkedinIcon from "@/assets/signup-icons/linkedin.png"
import NotionIcon from "@/assets/signup-icons/notion.png"
import SpotifyIcon from "@/assets/signup-icons/spotify.png"
import TwitchIcon from "@/assets/signup-icons/twitch.png"

export default function SignupPage() {
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
                <button className="service-button service-button-google">
                  <img src={GoogleIcon} alt="Google" className="service-icon" />
                  Google
                </button>
                <button className="service-button service-button-github">
                  <img src={GithubIcon} alt="Github" className="service-icon" />
                  Github
                </button>
                <button className="service-button service-button-spotify">
                  <img src={SpotifyIcon} alt="Spotify" className="service-icon" />
                  Spotify
                </button>
                <button className="service-button service-button-notion">
                  <img src={NotionIcon} alt="Notion" className="service-icon" />
                  Notion
                </button>
                <button className="service-button service-button-linkedin">
                  <img src={LinkedinIcon} alt="LinkedIn" className="service-icon" />
                  LinkedIn
                </button>
                <button className="service-button service-button-twitch">
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
