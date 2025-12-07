import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import "@/styles/Dashboard.css";

interface Area {
  id: string;
  name: string;
  is_active: boolean;
  user_id: string;
  last_executed_at?: string | null;
  error_log?: string | null;
  action: {
    name: string;
    parameters: Record<string, unknown>;
  };
  reactions: Array<{
    name: string;
    parameters: Record<string, unknown>;
  }>;
}

const getServiceFromAction = (actionName: string): string => {
  if (actionName.startsWith("GITHUB_")) return "github";
  if (actionName.startsWith("GOOGLE_")) return "google";
  if (actionName.startsWith("GMAIL_")) return "google";
  if (actionName.startsWith("DISCORD_")) return "discord";
  if (actionName.startsWith("SPOTIFY_")) return "spotify";
  if (actionName.startsWith("TWITCH_")) return "twitch";
  if (actionName.startsWith("NOTION_")) return "notion";
  if (actionName.startsWith("LINKEDIN_")) return "linkedin";
  return "unknown";
};

const serviceIcons: Record<string, string> = {
  github: "/assets/github.png",
  google: "/assets/google.png",
  discord: "/assets/discord.png",
  spotify: "/assets/spotify.png",
  twitch: "/assets/twitch.png",
  notion: "/assets/notion.png",
  linkedin: "/assets/linkedin.png",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAreas(areas);
    } else {
      setFilteredAreas(
        areas.filter((area) =>
          area.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, areas]);

  const fetchAreas = async () => {
    try {
      const data = await api.get<Area[]>("/areas");
      setAreas(data);
      setFilteredAreas(data);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = () => {
    navigate("/areas/create");
  };

  const getUniqueServices = (area: Area): string[] => {
    const services = new Set<string>();
    services.add(getServiceFromAction(area.action.name));
    area.reactions.forEach((reaction) => {
      services.add(getServiceFromAction(reaction.name));
    });
    return Array.from(services).filter((s) => s !== "unknown");
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <h1 className="dashboard-title">My AREAs</h1>

        <div className="dashboard-actions">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <Button
            onClick={handleCreateArea}
            className="create-button"
          >
            <Plus className="h-5 w-5" />
            Create
          </Button>
        </div>

        {loading ? (
          <div className="loading-state">Loading your areas...</div>
        ) : filteredAreas.length === 0 ? (
          <div className="empty-state">
            <p>No areas found{searchQuery && ` matching "${searchQuery}"`}.</p>
            {!searchQuery && (
              <Button onClick={handleCreateArea} className="create-first-button">
                Create your first AREA
              </Button>
            )}
          </div>
        ) : (
          <div className="areas-grid">
            {filteredAreas.map((area) => (
              <div key={area.id} className="area-card">
                <div className="area-header">
                  <h3 className="area-name">{area.name}</h3>
                  <div className={`area-status ${area.is_active ? "active" : "inactive"}`}>
                    <span className="status-dot"></span>
                    {area.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="area-services">
                  {getUniqueServices(area).map((service) => (
                    <div key={service} className="service-icon-wrapper">
                      <img
                        src={serviceIcons[service] || "/assets/default.png"}
                        alt={service}
                        className="service-icon"
                      />
                    </div>
                  ))}
                </div>

                <div className="area-footer">
                  <span className="area-action-label">
                    {area.action.name.replace(/_/g, " ")}
                  </span>
                  <span className="area-reactions-count">
                    {area.reactions.length} reaction{area.reactions.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
