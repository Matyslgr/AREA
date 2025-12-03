import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"

import { MyCarousel } from "@/components/MyCarousel"

import Navbar from "@/components/Navbar"
import heroDiscord from "@/assets/yt_discord_hero.png"
import heroYoutube from "@/assets/yt_gmail_hero.png"
import "./HomePage.css"

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/signin")
  }

  return (
    <div className="home-container">

      <Navbar />
    
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text-container">
            <div className="hero-text-wrapper">
              <h2 className="hero-title">
                Welcome to AREA !
              </h2>
                <p className="hero-description">
                Automate your workflow by linking the accounts of your favorite apps and services.
                AREA allows you to create powerful integrations between different platforms, enabling
                you to save time like syncing data, sending notifications, or managing tasks.
                </p>
            </div>
          </div>
          <div className="hero-images">
            <div className="hero-images-wrapper">
              <div className="images-container">
                <img src={heroDiscord} alt="Hero Illustration" className="hero-image-discord" />
                <img src={heroYoutube} alt="Hero Illustration" className="hero-image-youtube" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="features-context">
          <h2 className="features-title">Key Features</h2>
          <div className="features-carousel">
            <MyCarousel />
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
