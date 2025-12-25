import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const formatActionName = (name: string): string => {
  return name.replace(/_/g, " ").toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function AreaDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [area, setArea] = useState<AreaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchArea(id);
    }
  }, [id]);

  const fetchArea = async (areaId: string) => {
    try {
      const data = await api.get<AreaDto>(`/areas/${areaId}`);
      setArea(data);
    } catch (error) {
      console.error("Failed to fetch area:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!area) return;
    try {
      setError(null);
      await api.put(`/areas/${area.id}`, {
        is_active: !area.is_active,
      });
      setArea({ ...area, is_active: !area.is_active });
    } catch (error) {
      console.error("Failed to toggle area:", error);
      setError("Failed to toggle AREA status. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!area) return;

    try {
      setError(null);
      await api.delete(`/areas/${area.id}`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete area:", error);
      setError("Failed to delete AREA. Please try again.");
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            Loading area details...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!area) {
    return null;
  }

  const actionService = getServiceFromAction(area.action.name);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16 space-y-8">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="w-fit text-zinc-400 hover:text-white hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{area.name}</h1>
                <Badge
                  className={`${
                    area.is_active
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {area.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-zinc-400">
                {area.last_executed_at
                  ? `Last executed: ${new Date(area.last_executed_at).toLocaleString()}`
                  : "Never executed"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleToggleActive}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                {area.is_active ? (
                  <>
                    <PowerOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
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
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <span className="text-black font-bold text-lg">A</span>
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Action</CardTitle>
                  <CardDescription className="text-zinc-400">Trigger event</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                {actionService !== "unknown" && (
                  <div className="h-12 w-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-700">
                    <img
                      src={serviceIcons[actionService] || "/assets/default.png"}
                      alt={actionService}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-zinc-400 mb-1">Service</p>
                  <p className="font-semibold text-white capitalize">{actionService}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-200 mb-3">Action Details</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                    <p className="text-sm text-zinc-400 mb-1">Action Type</p>
                    <p className="font-medium text-white">{formatActionName(area.action.name)}</p>
                  </div>

                  {Object.keys(area.action.parameters).length > 0 && (
                    <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="text-sm text-zinc-400 mb-2">Parameters</p>
                      <div className="space-y-2">
                        {Object.entries(area.action.parameters).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-zinc-400 capitalize">{key.replace(/_/g, " ")}:</span>
                            <span className="text-white font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">
                    Reaction{area.reactions.length > 1 ? "s" : ""}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {area.reactions.length} response{area.reactions.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {area.reactions.map((reaction, index) => {
                const reactionService = getServiceFromAction(reaction.name);
                return (
                  <div key={index} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 space-y-3">
                    <div className="flex items-center gap-4">
                      {reactionService !== "unknown" && (
                        <div className="h-12 w-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-700">
                          <img
                            src={serviceIcons[reactionService] || "/assets/default.png"}
                            alt={reactionService}
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-zinc-400 mb-1">Service</p>
                        <p className="font-semibold text-white capitalize">{reactionService}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-700">
                      <p className="text-sm text-zinc-400 mb-1">Reaction Type</p>
                      <p className="font-medium text-white">{formatActionName(reaction.name)}</p>
                    </div>

                    {Object.keys(reaction.parameters).length > 0 && (
                      <div className="pt-3 border-t border-zinc-700">
                        <p className="text-sm text-zinc-400 mb-2">Parameters</p>
                        <div className="space-y-2">
                          {Object.entries(reaction.parameters).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-zinc-400 capitalize">{key.replace(/_/g, " ")}:</span>
                              <span className="text-white font-medium truncate ml-2 max-w-[200px]">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {area.error_log && (
          <Card className="bg-red-500/10 border-red-500/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-400">Error Log</CardTitle>
              <CardDescription className="text-red-400/70">Last execution error</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-red-300 whitespace-pre-wrap font-mono bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                {area.error_log}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete AREA</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{area.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteDialogOpen(false);
                handleDelete();
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
