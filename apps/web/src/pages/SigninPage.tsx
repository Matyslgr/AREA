import { SigninForm } from "@/components/signin-form"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import "./SigninPage.css"

import GithubIcon from "@/assets/icons/github.png"
import GoogleIcon from "@/assets/icons/google.png"
import LinkedinIcon from "@/assets/icons/linkedin.png"
import NotionIcon from "@/assets/icons/notion.png"
import SpotifyIcon from "@/assets/icons/spotify.png"
import TwitchIcon from "@/assets/icons/twitch.png"
import { api } from "@/lib/api"

export default function SigninPage() {
  const handleOAuthSignin = async (provider: string) => {
    try {
      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${provider}?mode=login`
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

      <Footer />
    </div>
  )
}
