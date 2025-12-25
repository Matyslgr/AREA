import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Zap, Activity, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { AreaDto } from "@area/shared";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const getServiceFromAction = (actionName: string): string => {
  if (actionName.startsWith("GITHUB_")) return "github";
  if (actionName.startsWith("GOOGLE_")) return "google";
  if (actionName.startsWith("GMAIL_")) return "google";
  if (actionName.startsWith("DISCORD_")) return "discord";
  if (actionName.startsWith("SPOTIFY_")) return "spotify";
  if (actionName.startsWith("TWITCH_")) return "twitch";
  if (actionName.startsWith("NOTION_")) return "notion";
  if (actionName.startsWith("LINKEDIN_")) return "linkedin";
  if (actionName.startsWith("TIMER_")) return "timer";
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
  timer: "https://img.icons8.com/fluency/96/clock.png",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<AreaDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const data = await api.get<AreaDto[]>("/areas");
      setAreas(data);
      setFilteredAreas(data);
    } catch (error) {
      console.error("Failed to fetch areas:", error);
      setError("Failed to load your areas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = () => {
    navigate("/areas/create");
  };

  const getUniqueServices = (area: AreaDto): string[] => {
    const services = new Set<string>();
    services.add(getServiceFromAction(area.action.name));
    area.reactions.forEach((reaction) => {
      services.add(getServiceFromAction(reaction.name));
    });
    return Array.from(services).filter((s) => s !== "unknown");
  };

  const activeAreas = areas.filter(area => area.is_active).length;
  const totalReactions = areas.reduce((sum, area) => sum + area.reactions.length, 0);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">My AREAs</h1>
          <p className="text-zinc-400">
            Manage and monitor your automation workflows
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total AREAs</CardTitle>
              <Layers className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{areas.length}</div>
              <p className="text-xs text-zinc-500">
                {activeAreas} active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active AREAs</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeAreas}</div>
              <p className="text-xs text-zinc-500">
                {areas.length > 0 ? Math.round((activeAreas / areas.length) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Reactions</CardTitle>
              <Zap className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalReactions}</div>
              <p className="text-xs text-zinc-500">
                Across all AREAs
              </p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    fetchAreas();
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
          </div>

          <Button
            onClick={handleCreateArea}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create AREA
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              Loading your areas...
            </div>
          </div>
        ) : filteredAreas.length === 0 ? (
          <Card className="py-16 bg-zinc-900 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {searchQuery ? "No areas found" : "No areas yet"}
              </h3>
              <p className="text-sm text-zinc-400 mb-6 max-w-sm">
                {searchQuery
                  ? `No areas matching "${searchQuery}"`
                  : "Create your first automation to get started with AREA"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={handleCreateArea}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create your first AREA
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAreas.map((area) => (
              <Card
                key={area.id}
                className="group bg-zinc-900 border-zinc-800 hover:border-amber-500/30 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-amber-500/5"
                onClick={() => navigate(`/areas/${area.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-1 text-white group-hover:text-amber-400 transition-colors">
                        {area.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1 text-zinc-500">
                        {area.action.name.replace(/_/g, " ")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={area.is_active ? "success" : "secondary"}
                      className={`ml-2 shrink-0 ${
                        area.is_active
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {area.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {getUniqueServices(area).map((service) => (
                      <div
                        key={service}
                        className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700"
                      >
                        <img
                          src={serviceIcons[service] || "/assets/default.png"}
                          alt={service}
                          className="h-5 w-5 object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-zinc-500 pt-2 border-t border-zinc-800">
                    <span className="font-medium">
                      {area.reactions.length} reaction{area.reactions.length !== 1 ? "s" : ""}
                    </span>
                    {area.last_executed_at && (
                      <span className="text-xs">
                        Last run: {new Date(area.last_executed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
