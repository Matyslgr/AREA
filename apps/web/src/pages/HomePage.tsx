import { MyCarousel } from "@/components/MyCarousel"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import heroDiscord from "@/assets/yt_discord_hero.png"
import heroYoutube from "@/assets/yt_gmail_hero.png"
import "./HomePage.css"

export default function HomePage() {

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

      <div className="-mt-16">
        <Footer />
      </div>

    </div>
  )
}
