import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
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
      const data = await api.get<AreaDto[]>("/areas");
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
    <div className="min-h-screen bg-gradient-to-br from-[#91B7FF] to-[#7BA5FF] flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16 space-y-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-white">My AREAs</h1>
          <p className="text-white/90">
            Manage and monitor your automation workflows
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Total AREAs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{areas.length}</div>
              <p className="text-xs text-gray-600">
                {activeAreas} active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Active AREAs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeAreas}</div>
              <p className="text-xs text-gray-600">
                {areas.length > 0 ? Math.round((activeAreas / areas.length) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Total Reactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalReactions}</div>
              <p className="text-xs text-gray-600">
                Across all AREAs
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Search areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-0 shadow-md text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <Button
            onClick={handleCreateArea}
            className="bg-white text-[#6097FF] hover:bg-white/90 font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create AREA
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-white">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Loading your areas...
            </div>
          </div>
        ) : filteredAreas.length === 0 ? (
          <Card className="py-12 bg-white border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {searchQuery ? "No areas found" : "No areas yet"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchQuery
                  ? `No areas matching "${searchQuery}"`
                  : "Create your first automation to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateArea} className="bg-[#6097FF] text-white hover:bg-[#5087EF] shadow-md">
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
                className="group bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1"
                onClick={() => navigate(`/areas/${area.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-1 text-gray-900">
                        {area.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1 text-gray-600">
                        {area.action.name.replace(/_/g, " ")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={area.is_active ? "success" : "secondary"}
                      className="ml-2 shrink-0"
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
                        className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={serviceIcons[service] || "/assets/default.png"}
                          alt={service}
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
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
