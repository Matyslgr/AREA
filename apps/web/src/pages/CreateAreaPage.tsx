import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, ArrowRight, Check, AlertCircle, Link as LinkIcon } from "lucide-react"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import type { ServiceDto, CreateAreaDto } from "@area/shared"

import GoogleIcon from "@/assets/icons/google.png"
import SpotifyIcon from "@/assets/icons/spotify.png"
import GithubIcon from "@/assets/icons/github.png"
import NotionIcon from "@/assets/icons/notion.png"
import LinkedinIcon from "@/assets/icons/linkedin.png"
import TwitchIcon from "@/assets/icons/twitch.png"

interface LinkedAccount {
  id: string
  service: string
  scopes: string[]
}

interface SavedState {
  step: number
  areaName: string
  actionServiceId?: string
  reactionServiceId?: string
  actionId?: string
  reactionId?: string
  actionParams: Record<string, unknown>
  reactionParams: Record<string, unknown>
}

const STORAGE_KEY_FORM = 'area-creation-state'

const STEPS = [
  { number: 1, title: "Name & Services", description: "Choose your AREA name and services" },
  { number: 2, title: "Action", description: "Select and configure the trigger" },
  { number: 3, title: "Reaction", description: "Select and configure the response" },
  { number: 4, title: "Review", description: "Confirm your automation" },
]

const serviceIcons: Record<string, string> = {
  timer: "https://img.icons8.com/fluency/96/clock.png",
  google: GoogleIcon,
  spotify: SpotifyIcon,
  github: GithubIcon,
  notion: NotionIcon,
  linkedin: LinkedinIcon,
  twitch: TwitchIcon
}

const getServiceIcon = (serviceId: string) => {
  return serviceIcons[serviceId] || "https://img.icons8.com/fluency/96/services.png"
}

export default function CreateAreaPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [services, setServices] = useState<ServiceDto[]>([])
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([])

  const [areaName, setAreaName] = useState("")
  const [selectedActionService, setSelectedActionService] = useState<ServiceDto | null>(null)
  const [selectedReactionService, setSelectedReactionService] = useState<ServiceDto | null>(null)
  const [selectedAction, setSelectedAction] = useState<ServiceDto["actions"][0] | null>(null)
  const [selectedReaction, setSelectedReaction] = useState<ServiceDto["reactions"][0] | null>(null)
  const [actionParams, setActionParams] = useState<Record<string, unknown>>({})
  const [reactionParams, setReactionParams] = useState<Record<string, unknown>>({})

  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [modalService, setModalService] = useState<string>("")
  const [modalScopes, setModalScopes] = useState<string[]>([])
  const [modalType, setModalType] = useState<"action" | "reaction">("action")

  useEffect(() => {
    fetchServices()
    fetchLinkedAccounts()
  }, [])

  // Effect to restore saved form state from localStorage
  useEffect(() => {
    // Only restore if services are loaded
    if (services.length === 0) return

    const savedJson = localStorage.getItem(STORAGE_KEY_FORM)
    if (!savedJson) return

    try {
      const saved: SavedState = JSON.parse(savedJson)

      // Restore simple fields setAreaName(saved.areaName)
      setCurrentStep(saved.step)
      setActionParams(saved.actionParams || {})
      setReactionParams(saved.reactionParams || {})

      // Restore complex objects (mapping ID -> Object)
      if (saved.actionServiceId) {
        const s = services.find(x => x.id === saved.actionServiceId)
        if (s) {
          setSelectedActionService(s)
          if (saved.actionId) {
            const a = s.actions.find(x => x.id === saved.actionId)
            setSelectedAction(a || null)
          }
        }
      }

      if (saved.reactionServiceId) {
        const s = services.find(x => x.id === saved.reactionServiceId)
        if (s) {
          setSelectedReactionService(s)
          if (saved.reactionId) {
            const r = s.reactions.find(x => x.id === saved.reactionId)
            setSelectedReaction(r || null)
          }
        }
      }

    } catch (e) {
      console.error("Failed to parse saved form state", e)
    }
  }, [services]) // Depend on services to ensure they are loaded first

  const fetchServices = async () => {
    try {
      const data = await api.get<ServiceDto[]>("/services")
      setServices(data)
      console.log("Fetched services:", data)
    } catch (err) {
      console.error("Failed to fetch services:", err)
    }
  }

  const fetchLinkedAccounts = async () => {
    try {
      const data = await api.get<{ linkedAccounts: Array<{ id: string; provider: string; scopes: string[] }> }>("/auth/account")
      const accounts = data.linkedAccounts || []
      console.log("Fetched linked accounts:", accounts)
      setLinkedAccounts(accounts.map((acc) => ({
        id: acc.id,
        service: acc.provider,
        scopes: acc.scopes || []
      })))
    } catch (err) {
      console.error("Failed to fetch linked accounts:", err)
      setLinkedAccounts([])
    }
  }

  const getServiceAccount = (serviceId: string) => {
    return linkedAccounts.find(acc => acc.service.toLowerCase() === serviceId.toLowerCase())
  }

  const hasRequiredScopes = (serviceId: string, requiredScopes: string[]) => {
    if (!requiredScopes || requiredScopes.length === 0) return true
    const account = getServiceAccount(serviceId)
    console.log("Checking scopes for service:", serviceId, "Required:", requiredScopes, "Account scopes:", account?.scopes)
    if (!account) return false
    return requiredScopes.every(scope => account.scopes.includes(scope))
  }

  const handleServiceSelect = (service: ServiceDto, type: "action" | "reaction") => {
    const account = getServiceAccount(service.id)

    console.log("Service OAuth requirement:", service.is_oauth, "Account found:", !!account)
    if (service.is_oauth && !account) {
      console.log("Service account not linked for:", service.name)
      setModalService(service.name)
      setModalType(type)
      setShowAccountModal(true)
      return
    }

    console.log("Selected service:", service.name, "for", type)

    if (type === "action") {
      setSelectedActionService(service)
    } else {
      setSelectedReactionService(service)
    }
  }

  const handleActionSelect = (action: ServiceDto["actions"][0]) => {
    const account = getServiceAccount(selectedActionService!.id)

    if (selectedActionService!.is_oauth && action.scopes && action.scopes.length > 0) {
      if (!account || !hasRequiredScopes(selectedActionService!.id, action.scopes)) {
        setModalService(selectedActionService!.name)
        setModalScopes(action.scopes)
        setModalType("action")
        setShowPermissionModal(true)
        return
      }
    }

    setSelectedAction(action)
    setActionParams({})
  }

  const handleReactionSelect = (reaction: ServiceDto["reactions"][0]) => {
    const account = getServiceAccount(selectedReactionService!.id)

    if (selectedReactionService!.is_oauth && reaction.scopes && reaction.scopes.length > 0) {
      if (!account || !hasRequiredScopes(selectedReactionService!.id, reaction.scopes)) {
        setModalService(selectedReactionService!.name)
        setModalScopes(reaction.scopes)
        setModalType("reaction")
        setShowPermissionModal(true)
        return
      }
    }

    setSelectedReaction(reaction)
    setReactionParams({})
  }

  const saveFormState = () => {
    const state: SavedState = {
      step: currentStep,
      areaName,
      actionServiceId: selectedActionService?.id,
      reactionServiceId: selectedReactionService?.id,
      actionId: selectedAction?.id,
      reactionId: selectedReaction?.id,
      actionParams,
      reactionParams
    }
    localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(state))
  }

  const handleLinkAccount = async () => {
    try {
      const serviceId = services.find(s => s.name === modalService)?.id
      if (!serviceId) return

      saveFormState()

      localStorage.setItem('oauth-redirect', '/areas/create')

      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${serviceId}?mode=connect`
      )

      window.location.href = url
    } catch (err) {
      console.error(`Failed to link ${modalService}:`, err)
    }
  }

  const handleRequestPermissions = async () => {
    try {
      const serviceId = services.find(s => s.name === modalService)?.id
      if (!serviceId) return

      saveFormState()

      localStorage.setItem('oauth-redirect', '/areas/create')

      console.log("Requesting additional permissions for scopes:", modalScopes)

      const scopeParam = encodeURIComponent(modalScopes.join(' '))

      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${serviceId}?mode=connect&scope=${scopeParam}`
      )

      window.location.href = url
    } catch (err) {
      console.error(`Failed to request permissions for ${modalService}:`, err)
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && (!areaName || !selectedActionService || !selectedReactionService)) {
      setError("Please fill in all fields")
      return
    }
    if (currentStep === 2) {
      if (!selectedAction) {
        setError("Please select an action")
        return
      }
      if (selectedAction.parameters && selectedAction.parameters.length > 0) {
        for (const param of selectedAction.parameters) {
          if (param.required && (!actionParams[param.name] || String(actionParams[param.name]).trim() === '')) {
            setError(`Please fill in the required parameter: ${param.description}`)
            return
          }
        }
      }
    }
    if (currentStep === 3) {
      if (!selectedReaction) {
        setError("Please select a reaction")
        return
      }
      if (selectedReaction.parameters && selectedReaction.parameters.length > 0) {
        for (const param of selectedReaction.parameters) {
          if (param.required && (!reactionParams[param.name] || String(actionParams[param.name]).trim() === '')) {
            setError(`Please fill in the required parameter: ${param.description}`)
            return
          }
        }
      }
    }
    setError("")
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    console.log("Back button clicked! Current step:", currentStep)
    setError("")
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      const actionAccount = getServiceAccount(selectedActionService!.id)
      const reactionAccount = getServiceAccount(selectedReactionService!.id)

      const payload: CreateAreaDto = {
        name: areaName,
        action: {
          name: selectedAction!.id,
          parameters: actionParams,
          ...(actionAccount && { accountId: actionAccount.id }),
        },
        reactions: [
          {
            name: selectedReaction!.id,
            parameters: reactionParams,
            ...(reactionAccount && { accountId: reactionAccount.id }),
          },
        ],
      }

      await api.post("/areas", payload)
      localStorage.removeItem(STORAGE_KEY_FORM)
      navigate("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create AREA")
    } finally {
      setLoading(false)
    }
  }

  const renderParameterInput = (param: ServiceDto["actions"][0]["parameters"][0], value: unknown, onChange: (key: string, val: string | number | boolean) => void, prefix: string) => {
    return (
      <div key={param.name} className="space-y-2">
        <Label htmlFor={`${prefix}-${param.name}`} className="text-gray-900 text-sm font-medium">
          {param.description}
          {param.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {param.type === "number" ? (
          <Input
            id={`${prefix}-${param.name}`}
            type="number"
            placeholder={`Enter ${param.description}`}
            value={String(value || "")}
            onChange={(e) => onChange(param.name, e.target.value)}
            required={param.required}
            className="text-black"
          />
        ) : param.type === "boolean" ? (
          <select
            id={`${prefix}-${param.name}`}
            value={String(value || "")}
            onChange={(e) => onChange(param.name, e.target.value === "true")}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required={param.required}
          >
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        ) : (
          <Input
            id={`${prefix}-${param.name}`}
            type="text"
            placeholder={`Enter ${param.description}`}
            value={String(value || "")}
            onChange={(e) => onChange(param.name, e.target.value)}
            required={param.required}
            className="text-black"
          />
        )}
        <p className="text-xs text-gray-500">Type: {param.type}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#91B7FF] to-[#7BA5FF] flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16">
        {/* Stepper */}
        <Card className="mb-8 max-w-4xl mx-auto bg-white border-0 shadow-lg">
          <CardContent className="pt-6">
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
                          : "bg-gray-200 text-gray-500"
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
          </CardContent>
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
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Step 1: Name & Services */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="areaName" className="text-black">AREA Name</Label>
                  <Input
                    id="areaName"
                    placeholder="e.g., Send me an email every day"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="text-black"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-gray-900 text-base font-semibold flex items-center gap-2">Action Service (Trigger)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {services.filter(s => s.actions.length > 0).map((service) => {
                        const isLinked = getServiceAccount(service.id) || !service.is_oauth
                        return (
                          <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service, "action")}
                            className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                              selectedActionService?.id === service.id
                                ? "border-[#6097FF] bg-[#6097FF]/10"
                                : "border-gray-200 hover:border-[#6097FF]/50 bg-white"
                            }`}
                          >
                            <img
                              src={getServiceIcon(service.id) || "/assets/default.png"}
                              alt={service.name}
                              className="h-12 w-12 mx-auto mb-2"
                            />
                            <p className="text-sm font-medium text-gray-900">{service.name}</p>
                            {!isLinked && (
                              <Badge variant="outline" className="absolute top-2 right-2 text-xs text-gray-700">
                                <LinkIcon className="h-3 w-3 mr-1" />
                                Link
                              </Badge>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-900 text-base font-semibold flex items-center gap-2">
                      Reaction Service (Response)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {services.filter(s => s.reactions.length > 0).map((service) => {
                        const isLinked = getServiceAccount(service.id) || !service.is_oauth
                        return (
                          <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service, "reaction")}
                            className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                              selectedReactionService?.id === service.id
                                ? "border-[#6097FF] bg-[#6097FF]/10"
                                : "border-gray-200 hover:border-[#6097FF]/50 bg-white"
                            }`}
                          >
                            <img
                              src={getServiceIcon(service.id) || "/assets/default.png"}
                              alt={service.name}
                              className="h-12 w-12 mx-auto mb-2"
                            />
                            <p className="text-sm font-medium text-gray-900">{service.name}</p>
                            {!isLinked && (
                              <Badge variant="outline" className="absolute top-2 right-2 text-xs text-gray-700">
                                <LinkIcon className="h-3 w-3 mr-1" />
                                Link
                              </Badge>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Action */}
            {currentStep === 2 && selectedActionService && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <img
                    src={getServiceIcon(selectedActionService.id) || "/assets/default.png"}
                    alt={selectedActionService.name}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedActionService.name} Actions</p>
                    <p className="text-sm text-gray-600">Choose what triggers this automation</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedActionService.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionSelect(action)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedAction?.id === action.id
                          ? "border-[#6097FF] bg-[#6097FF]/10"
                          : "border-gray-200 hover:border-[#6097FF]/50 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{action.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        </div>
                        {selectedAction?.id === action.id && (
                          <Badge variant="success">Selected</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedAction && selectedAction.parameters.length > 0 && (
                  <div className="mt-6 space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                    <h4 className="font-semibold text-gray-900">Configure Parameters</h4>
                    {selectedAction.parameters.map((param) =>
                      renderParameterInput(
                        param,
                        actionParams[param.name],
                        (key, val) => setActionParams({ ...actionParams, [key]: val }),
                        "action"
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select Reaction */}
            {currentStep === 3 && selectedReactionService && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <img
                    src={getServiceIcon(selectedReactionService.id) || "/assets/default.png"}
                    alt={selectedReactionService.name}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedReactionService.name} Reactions</p>
                    <p className="text-sm text-gray-600">Choose what happens when triggered</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedReactionService.reactions.map((reaction) => (
                    <button
                      key={reaction.id}
                      onClick={() => handleReactionSelect(reaction)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedReaction?.id === reaction.id
                          ? "border-[#6097FF] bg-[#6097FF]/10"
                          : "border-gray-200 hover:border-[#6097FF]/50 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{reaction.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{reaction.description}</p>
                        </div>
                        {selectedReaction?.id === reaction.id && (
                          <Badge variant="success">Selected</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedReaction && selectedReaction.parameters.length > 0 && (
                  <div className="mt-6 space-y-4 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 shadow-sm">
                    <h4 className="font-semibold text-gray-900">Configure Parameters</h4>
                    {selectedReaction.parameters.map((param) =>
                      renderParameterInput(
                        param,
                        reactionParams[param.name],
                        (key, val) => setReactionParams({ ...reactionParams, [key]: val }),
                        "reaction"
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {areaName}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500">WHEN</p>
                        <p className="font-semibold text-gray-900">{selectedAction?.name}</p>
                        <p className="text-sm text-gray-600">{selectedAction?.description}</p>
                        {Object.keys(actionParams).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(actionParams).map(([key, value]) => (
                              <p key={key} className="text-xs text-gray-600">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500">THEN</p>
                        <p className="font-semibold text-gray-900">{selectedReaction?.name}</p>
                        <p className="text-sm text-gray-600">{selectedReaction?.description}</p>
                        {Object.keys(reactionParams).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(reactionParams).map(([key, value]) => (
                              <p key={key} className="text-xs text-gray-600">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Check className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    Your AREA will be created as <strong>active</strong> and will start working immediately.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium border border-red-300 bg-white text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {currentStep < 4 ? (
                <Button onClick={handleNext} className="bg-[#6097FF] text-white hover:bg-[#5087EF]">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {loading ? "Creating..." : "Create"}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Not Linked Modal */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <LinkIcon className="h-5 w-5 text-[#6097FF]" />
              Link Your {modalService} Account
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              You need to link your {modalService} account to use this service in your AREAs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Linking your account allows AREA to perform actions on your behalf using {modalService}.
              You'll be redirected to {modalService} to authorize the connection.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccountModal(false)} className="text-gray-900">
              Cancel
            </Button>
            <Button onClick={handleLinkAccount} className="bg-[#6097FF] text-white hover:bg-[#5087EF]">
              <LinkIcon className="h-4 w-4 mr-2" />
              Link Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Missing Permissions Modal */}
      <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Additional Permissions Required
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This {modalType} requires additional permissions from your {modalService} account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-3">
              The following permissions are needed:
            </p>
            <ul className="space-y-2">
              {modalScopes.map((scope) => (
                <li key={scope} className="text-xs bg-gray-50 border border-gray-200 p-2 rounded font-mono text-gray-700">
                  {scope}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionModal(false)} className="text-gray-900">
              Cancel
            </Button>
            <Button onClick={handleRequestPermissions} className="bg-[#6097FF] text-white hover:bg-[#5087EF]">
              Grant Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
