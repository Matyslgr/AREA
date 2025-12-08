import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

interface Parameter {
  [key: string]: string
}

interface Action {
  name: string
  description: string
  parameters: Parameter
  scopes?: string[]
}

interface Reaction {
  name: string
  description: string
  parameters: Parameter
}

interface ServiceData {
  name: string
  icon: string
  actions: Action[]
  reactions: Reaction[]
}

import GithubIcon from "@/assets/icons/github.png"
import GoogleIcon from "@/assets/icons/google.png"
import SpotifyIcon from "@/assets/icons/spotify.png"

const MOCK_SERVICES: ServiceData[] = [
  {
    name: "Gmail",
    icon: GoogleIcon,
    actions: [
      {
        name: "GMAIL_NEW_EMAIL",
        description: "Triggered when a new email is received",
        parameters: {},
      },
    ],
    reactions: [
      {
        name: "GMAIL_SEND_EMAIL",
        description: "Sends an email using your Gmail account",
        parameters: {
          to: "string",
          subject: "string",
          body: "string",
        },
      },
    ],
  },
  {
    name: "GitHub",
    icon: GithubIcon,
    actions: [
      {
        name: "GITHUB_NEW_ISSUE",
        description: "Triggered when a new issue is created",
        parameters: {
          repository: "string",
        },
      },
    ],
    reactions: [
      {
        name: "GITHUB_CREATE_ISSUE",
        description: "Creates a new issue in a repository",
        parameters: {
          repository: "string",
          title: "string",
          body: "string",
        },
      },
    ],
  },
  {
    name: "Spotify",
    icon: SpotifyIcon,
    actions: [
      {
        name: "SPOTIFY_NEW_PLAYLIST_TRACK",
        description: "Triggered when a new track is added to a playlist",
        parameters: {
          playlist_id: "string",
        },
      },
    ],
    reactions: [
      {
        name: "SPOTIFY_ADD_PLAYLIST_TRACK",
        description: "Adds a track to a playlist",
        parameters: {
          playlist_id: "string",
          track_uri: "string",
        },
      },
    ],
  },
]

const STEPS = [
  { number: 1, title: "Name & Services", description: "Choose your AREA name and services" },
  { number: 2, title: "Action", description: "Select and configure the trigger" },
  { number: 3, title: "Reaction", description: "Select and configure the response" },
  { number: 4, title: "Review", description: "Confirm your automation" },
]

export default function CreateAreaPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [areaName, setAreaName] = useState("")
  const [actionService, setActionService] = useState<ServiceData | null>(null)
  const [reactionService, setReactionService] = useState<ServiceData | null>(null)
  const [selectedAction, setSelectedAction] = useState<Action | null>(null)
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null)
  const [actionParams, setActionParams] = useState<Parameter>({})
  const [reactionParams, setReactionParams] = useState<Parameter>({})

  const handleNext = () => {
    if (currentStep === 1 && (!areaName || !actionService || !reactionService)) {
      setError("Please fill in all fields")
      return
    }
    if (currentStep === 2 && !selectedAction) {
      setError("Please select an action")
      return
    }
    if (currentStep === 3 && !selectedReaction) {
      setError("Please select a reaction")
      return
    }
    setError("")
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setError("")
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      const payload = {
        name: areaName,
        action: {
          name: selectedAction!.name,
          parameters: actionParams,
        },
        reactions: [
          {
            name: selectedReaction!.name,
            parameters: reactionParams,
          },
        ],
      }

      await api.post("/areas", payload)
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create AREA")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#91B7FF] to-[#7BA5FF]">
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-8">
        {/* Stepper */}
        <Card className="mb-8 max-w-4xl mx-auto bg-white shadow-lg border-0 p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.number
                        ? "bg-green-500 text-white"
                        : currentStep === step.number
                        ? "bg-[#6097FF] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                  </div>
                  <div className="mt-2 text-center hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="max-w-4xl mx-auto bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="areaName" className="text-gray-900 text-base">AREA Name</Label>
                  <Input
                    id="areaName"
                    placeholder="e.g., Notify me on Discord when I get a GitHub issue"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="text-gray-900"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-gray-900 text-base flex items-center gap-2">
                      Action Service (Trigger)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {MOCK_SERVICES.filter(s => s.actions.length > 0).map((service) => (
                        <button
                          key={service.name}
                          onClick={() => setActionService(service)}
                          className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                            actionService?.name === service.name
                              ? "border-[#6097FF] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={service.icon}
                            alt={service.name}
                            className="h-12 w-12 mx-auto mb-2"
                          />
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-900 text-base flex items-center gap-2">
                      Reaction Service (Response)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {MOCK_SERVICES.filter(s => s.reactions.length > 0).map((service) => (
                        <button
                          key={service.name}
                          onClick={() => setReactionService(service)}
                          className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                            reactionService?.name === service.name
                              ? "border-[#6097FF] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={service.icon}
                            alt={service.name}
                            className="h-12 w-12 mx-auto mb-2"
                          />
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && actionService && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <img src={actionService.icon} alt={actionService.name} className="h-10 w-10" />
                  <div>
                    <p className="font-semibold text-gray-900">{actionService.name} Actions</p>
                    <p className="text-sm text-gray-600">Choose what triggers this automation</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {actionService.actions.map((action) => (
                    <button
                      key={action.name}
                      onClick={() => {
                        setSelectedAction(action)
                        setActionParams({})
                      }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedAction?.name === action.name
                          ? "border-[#6097FF] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{action.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        </div>
                        {selectedAction?.name === action.name && (
                          <Badge className="bg-green-500">Selected</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedAction && Object.keys(selectedAction.parameters).length > 0 && (
                  <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Configure Parameters</h4>
                    {Object.entries(selectedAction.parameters).map(([key, type]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`action-${key}`} className="text-gray-900 capitalize">
                          {key.replace(/_/g, " ")}
                        </Label>
                        <Input
                          id={`action-${key}`}
                          type="text"
                          placeholder={`Enter ${key}`}
                          value={actionParams[key] || ""}
                          onChange={(e) =>
                            setActionParams({ ...actionParams, [key]: e.target.value })
                          }
                          className="text-gray-900"
                        />
                        <p className="text-xs text-gray-500">Type: {type as string}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && reactionService && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                  <img src={reactionService.icon} alt={reactionService.name} className="h-10 w-10" />
                  <div>
                    <p className="font-semibold text-gray-900">{reactionService.name} Reactions</p>
                    <p className="text-sm text-gray-600">Choose what happens when triggered</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {reactionService.reactions.map((reaction) => (
                    <button
                      key={reaction.name}
                      onClick={() => {
                        setSelectedReaction(reaction)
                        setReactionParams({})
                      }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedReaction?.name === reaction.name
                          ? "border-[#6097FF] bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{reaction.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{reaction.description}</p>
                        </div>
                        {selectedReaction?.name === reaction.name && (
                          <Badge className="bg-green-500">Selected</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedReaction && Object.keys(selectedReaction.parameters).length > 0 && (
                  <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Configure Parameters</h4>
                    {Object.entries(selectedReaction.parameters).map(([key, type]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`reaction-${key}`} className="text-gray-900 capitalize">
                          {key.replace(/_/g, " ")}
                        </Label>
                        <Input
                          id={`reaction-${key}`}
                          type="text"
                          placeholder={`Enter ${key}`}
                          value={reactionParams[key] || ""}
                          onChange={(e) =>
                            setReactionParams({ ...reactionParams, [key]: e.target.value })
                          }
                          className="text-gray-900"
                        />
                        <p className="text-xs text-gray-500">Type: {type as string}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {areaName}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500">WHEN</p>
                        <p className="font-semibold text-gray-900">{selectedAction?.name}</p>
                        <p className="text-sm text-gray-600">{selectedAction?.description}</p>
                        {Object.keys(actionParams).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(actionParams).map(([key, value]) => (
                              <p key={key} className="text-xs text-gray-600">
                                <span className="font-medium">{key}:</span> {value}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="bg-orange-100 p-2 rounded-full">
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500">THEN</p>
                        <p className="font-semibold text-gray-900">{selectedReaction?.name}</p>
                        <p className="text-sm text-gray-600">{selectedReaction?.description}</p>
                        {Object.keys(reactionParams).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(reactionParams).map(([key, value]) => (
                              <p key={key} className="text-xs text-gray-600">
                                <span className="font-medium">{key}:</span> {value}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your AREA will be created as <strong>active</strong> and will start working immediately.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </div>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#6097FF] hover:bg-[#5087EF] text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? "Creating..." : "Create"}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
