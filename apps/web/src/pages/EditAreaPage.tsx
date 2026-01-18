import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, Zap, Workflow } from "lucide-react"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import type { AreaDto } from "@area/shared"

const getServiceFromAction = (actionName: string): string => {
  if (actionName.startsWith("GITHUB_")) return "github"
  if (actionName.startsWith("GOOGLE_")) return "google"
  if (actionName.startsWith("GMAIL_")) return "google"
  if (actionName.startsWith("DISCORD_")) return "discord"
  if (actionName.startsWith("SPOTIFY_")) return "spotify"
  if (actionName.startsWith("TWITCH_")) return "twitch"
  if (actionName.startsWith("NOTION_")) return "notion"
  if (actionName.startsWith("LINKEDIN_")) return "linkedin"
  if (actionName.startsWith("TIMER_")) return "timer"
  return "unknown"
}

const serviceIcons: Record<string, string> = {
  github: "/assets/github.png",
  google: "/assets/google.png",
  discord: "/assets/discord.png",
  spotify: "/assets/spotify.png",
  twitch: "/assets/twitch.png",
  notion: "/assets/notion.png",
  linkedin: "/assets/linkedin.png",
  timer: "https://img.icons8.com/fluency/96/clock.png",
}

const shouldInvertIcon = (serviceId: string) => {
  return serviceId === "github" || serviceId === "notion";
}

const formatActionName = (name: string): string => {
  return name.replace(/_/g, " ").toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function EditAreaPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [area, setArea] = useState<AreaDto | null>(null)

  const [areaName, setAreaName] = useState("")
  const [actionParams, setActionParams] = useState<Record<string, unknown>>({})
  const [reactionParams, setReactionParams] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (id) {
      fetchArea(id)
    }
  }, [id])

  const fetchArea = async (areaId: string) => {
    try {
      setLoading(true)
      const data = await api.get<AreaDto>(`/areas/${areaId}`)
      setArea(data)
      setAreaName(data.name)
      setActionParams(data.action.parameters || {})
      setReactionParams(data.reactions[0]?.parameters || {})
    } catch (err) {
      console.error("Failed to fetch area:", err)
      setError("Failed to load AREA")
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!area || !id) return

    if (!areaName.trim()) {
      setError("Please enter an AREA name")
      return
    }

    try {
      setSaving(true)
      setError("")

      await api.put(`/areas/${id}`, {
        name: areaName,
        action: {
          name: area.action.name,
          parameters: actionParams
        },
        reactions: area.reactions.map((reaction, index) => ({
          name: reaction.name,
          parameters: index === 0 ? reactionParams : reaction.parameters
        }))
      })

      navigate(`/areas/${id}`)
    } catch (err) {
      console.error("Failed to update area:", err)
      if (err instanceof Error) {
        setError("Failed to update AREA")
      }
    } finally {
      setSaving(false)
    }
  }

  const renderParameterInput = (
    paramName: string,
    paramType: string,
    paramDescription: string,
    value: unknown,
    onChange: (val: unknown) => void
  ) => {
    if (paramType === "boolean") {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={paramName}
            checked={value as boolean || false}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-amber-400"
          />
          <Label htmlFor={paramName} className="text-sm text-zinc-300 cursor-pointer">
            {paramDescription}
          </Label>
        </div>
      )
    }

    if (paramType === "number") {
      return (
        <Input
          type="number"
          value={value as number || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={paramDescription}
          className="bg-zinc-900 border-zinc-700 text-white"
        />
      )
    }

    return (
      <Input
        type="text"
        value={value as string || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={paramDescription}
        className="bg-zinc-900 border-zinc-700 text-white"
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!area) {
    return null
  }

  const actionService = getServiceFromAction(area.action.name)
  const reactionService = area.reactions.length > 0 ? getServiceFromAction(area.reactions[0].name) : "unknown"

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16">
        <Button
          variant="ghost"
          onClick={() => navigate(`/areas/${id}`)}
          className="mb-6 text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Details
        </Button>

        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              Edit {areaName || "Untitled AREA"}
            </h1>
            <p className="text-zinc-400">
              Modify your automation settings
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <Card className="bg-zinc-900 border-zinc-800 shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white">AREA Name</CardTitle>
              <CardDescription className="text-zinc-400">
                Give your automation a descriptive and memorable name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g., GitHub Stars to Discord Notifications"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400 focus:ring-amber-400/20"
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-black" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-white">Action</CardTitle>
                  <CardDescription className="text-zinc-400">Configure trigger event</CardDescription>
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
                      className={`h-8 w-8 object-contain ${shouldInvertIcon(actionService) ? "invert" : ""}`}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-zinc-400 mb-1">Service</p>
                  <p className="font-semibold text-white capitalize">{actionService}</p>
                </div>
              </div>

              <div>
                <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-4">
                  <p className="text-sm text-zinc-400 mb-1">Action Type</p>
                  <p className="font-medium text-white">{formatActionName(area.action.name)}</p>
                </div>

                {Object.keys(actionParams).length === 0 ? (
                  <p className="text-sm text-zinc-500 italic">No parameters to configure</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-zinc-200">Parameters</p>
                    {Object.entries(actionParams).map(([key, value]) => (
                      <div key={key} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 space-y-2">
                        <Label className="text-zinc-300 capitalize font-medium">
                          {key.replace(/_/g, " ")}
                        </Label>
                        {renderParameterInput(
                          key,
                          typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : "string",
                          key.replace(/_/g, " "),
                          value,
                          (newVal) => setActionParams({ ...actionParams, [key]: newVal })
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {area.reactions.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <Workflow className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-white">Reaction</CardTitle>
                    <CardDescription className="text-zinc-400">Configure response action</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  {reactionService !== "unknown" && (
                    <div className="h-12 w-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-700">
                      <img
                        src={serviceIcons[reactionService] || "/assets/default.png"}
                        alt={reactionService}
                        className={`h-8 w-8 object-contain ${shouldInvertIcon(reactionService) ? "invert" : ""}`}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-zinc-400 mb-1">Service</p>
                    <p className="font-semibold text-white capitalize">{reactionService}</p>
                  </div>
                </div>

                <div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 mb-4">
                    <p className="text-sm text-zinc-400 mb-1">Reaction Type</p>
                    <p className="font-medium text-white">{formatActionName(area.reactions[0].name)}</p>
                  </div>

                  {Object.keys(reactionParams).length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No parameters to configure</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-zinc-200">Parameters</p>
                      {Object.entries(reactionParams).map(([key, value]) => (
                        <div key={key} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 space-y-2">
                          <Label className="text-zinc-300 capitalize font-medium">
                            {key.replace(/_/g, " ")}
                          </Label>
                          {renderParameterInput(
                            key,
                            typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : "string",
                            key.replace(/_/g, " "),
                            value,
                            (newVal) => setReactionParams({ ...reactionParams, [key]: newVal })
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              onClick={() => navigate(`/areas/${id}`)}
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:from-amber-500 hover:to-orange-600"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
