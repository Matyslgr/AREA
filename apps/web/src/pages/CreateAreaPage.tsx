import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
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
import { ArrowLeft, ArrowRight, Check, AlertCircle, Link as LinkIcon, HelpCircle } from "lucide-react"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import type { ServiceDto, CreateAreaDto, ServiceActionDto, ServiceReactionDto } from "@area/shared"

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

// Helper component to display variable pills
const VariablePills = ({
  variables,
  onInsert
}: {
  variables: { name: string; description: string }[],
  onInsert: (tag: string) => void
}) => {
  if (!variables || variables.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
        Available Ingredients (Click to insert)
      </p>
      <div className="flex flex-wrap gap-2">
        {variables.map((v) => (
          <button
            key={v.name}
            type="button"
            onClick={() => onInsert(`{{${v.name}}}`)}
            className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
            title={v.description}
          >
            {v.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function CreateAreaPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [services, setServices] = useState<ServiceDto[]>([])
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([])

  const [areaName, setAreaName] = useState("")
  const [selectedActionService, setSelectedActionService] = useState<ServiceDto | null>(null)
  const [selectedReactionService, setSelectedReactionService] = useState<ServiceDto | null>(null)
  const [selectedAction, setSelectedAction] = useState<ServiceActionDto | null>(null)
  const [selectedReaction, setSelectedReaction] = useState<ServiceReactionDto | null>(null)
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

  useEffect(() => {
    const linked = searchParams.get('linked')
    if (linked === 'true') {
      fetchLinkedAccounts()
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('linked')
      setSearchParams(newParams, { replace: true })
    }
  }, [])

  // Effect to restore saved form state from localStorage
  useEffect(() => {
    // Only restore if services are loaded
    if (services.length === 0) return

    const savedJson = localStorage.getItem(STORAGE_KEY_FORM)
    if (!savedJson) return

    try {
      const saved: SavedState = JSON.parse(savedJson)

      // Restore simple fields
      setAreaName(saved.areaName)
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

  // Auto-save form state with debounce to avoid excessive localStorage writes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      saveFormState()
    }, 500) // Wait 500ms after last change before saving

    return () => clearTimeout(debounceTimer)
  }, [areaName, currentStep, selectedActionService, selectedReactionService, selectedAction, selectedReaction, actionParams, reactionParams])

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
      setSelectedAction(null)
      setActionParams({})
    } else {
      setSelectedReactionService(service)
      setSelectedReaction(null)
      setReactionParams({})
    }
  }

  const handleActionSelect = (action: ServiceActionDto) => {
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

    console.log("Selected action:", action.name)
    console.log("Action return values:", action.return_values)
    setSelectedAction(action)
    setActionParams({})
  }

  const handleReactionSelect = (reaction: ServiceReactionDto) => {
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

      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${serviceId}?mode=connect&redirect=${encodeURIComponent(window.location.origin + "/areas/create")}`
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

      console.log("Requesting additional permissions for scopes:", modalScopes)

      const scopeParam = encodeURIComponent(modalScopes.join(' '))

      const { url } = await api.get<{ url: string }>(
        `/auth/oauth/authorize/${serviceId}?mode=connect&source=web&scope=${scopeParam}&redirect=${encodeURIComponent(window.location.origin + "/areas/create")}`
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

  const handleCancel = () => {
    localStorage.removeItem(STORAGE_KEY_FORM)
    navigate("/dashboard")
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

  // Fonction pour insérer une variable dans le champ texte
  const insertVariable = (paramName: string, tag: string, isAction: boolean) => {
    const currentParams = isAction ? actionParams : reactionParams;
    const currentValue = String(currentParams[paramName] || "");

    // Ajoute à la fin (simple) ou à la position du curseur (plus complexe, nécessite une ref)
    const newValue = currentValue + " " + tag;

    if (isAction) {
      setActionParams({ ...actionParams, [paramName]: newValue });
    } else {
      setReactionParams({ ...reactionParams, [paramName]: newValue });
    }
  };

  const getParameterHint = (serviceId: string, paramName: string): string | null => {
    const hints: Record<string, Record<string, string>> = {
      notion: {
        page_id: "Copy the ID from your Notion page URL after 'p=' (remove hyphens)",
        database_id: "Copy the ID from your Notion database URL from after '.so/' to '?' (remove hyphens)",
        parent_page_id: "Copy the ID from your parent Notion page URL after 'p=' (remove hyphens)",
      }
    };
    return hints[serviceId]?.[paramName] || null;
  };

  const renderParameterInput = (
    param: ServiceDto["actions"][0]["parameters"][0],
    value: unknown,
    onChange: (key: string, val: string | number | boolean) => void,
    prefix: string,
    availableVariables?: { name: string, description: string, example?: string }[],
    serviceId?: string
  ) => {
    const hint = serviceId ? getParameterHint(serviceId, param.name) : null;

    return (
      <div key={param.name} className="space-y-2">
        <div className="flex justify-between items-baseline">
            <Label htmlFor={`${prefix}-${param.name}`} className="text-zinc-200 text-sm font-medium">
            {param.description}
            {param.required && <span className="text-amber-400 ml-1">*</span>}
            </Label>
        </div>
        {hint && (
          <div className="flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded-md">
            <HelpCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">{hint}</p>
          </div>
        )}

        {/* Afficher les variables uniquement pour les champs texte des REACTIONS */}
        {availableVariables && param.type === "string" && (
            <VariablePills
                variables={availableVariables}
                onInsert={(tag) => insertVariable(param.name, tag, prefix === "action")}
            />
        )}

        {param.type === "number" ? (
          <Input
            id={`${prefix}-${param.name}`}
            type="number"
            placeholder={`Enter ${param.description}`}
            value={String(value || "")}
            onChange={(e) => onChange(param.name, e.target.value)}
            required={param.required}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
          />
        ) : param.type === "boolean" ? (
          <select
            id={`${prefix}-${param.name}`}
            value={String(value || "")}
            onChange={(e) => onChange(param.name, e.target.value === "true")}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
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
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 pt-28 md:pt-32 pb-16">
        {/* Stepper */}
        <Card className="mb-8 max-w-4xl mx-auto bg-zinc-900 border-zinc-800">
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
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                    </div>
                    <div className="mt-2 text-center hidden md:block">
                      <p className="text-sm font-semibold text-zinc-200">{step.title}</p>
                      <p className="text-xs text-zinc-500">{step.description}</p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-colors rounded-full ${
                        currentStep > step.number ? "bg-green-500" : "bg-zinc-800"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto bg-zinc-900 border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Step 1: Name & Services */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="areaName" className="text-zinc-200">AREA Name</Label>
                  <Input
                    id="areaName"
                    placeholder="e.g., Send me an email every day"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500/50"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-zinc-200 text-base font-semibold flex items-center gap-2">Action Service (Trigger)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {services.filter(s => s.actions.length > 0).map((service) => {
                        const isLinked = getServiceAccount(service.id) || !service.is_oauth
                        return (
                          <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service, "action")}
                            className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                              selectedActionService?.id === service.id
                                ? "border-amber-500 bg-amber-500/10"
                                : "border-zinc-700 hover:border-amber-500/50 bg-zinc-800"
                            }`}
                          >
                            <img
                              src={getServiceIcon(service.id) || "/assets/default.png"}
                              alt={service.name}
                              className="h-12 w-12 mx-auto mb-2"
                            />
                            <p className="text-sm font-medium text-zinc-200">{service.name}</p>
                            {!isLinked && (
                              <Badge variant="outline" className="absolute top-2 right-2 text-xs text-zinc-400 border-zinc-600">
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
                    <Label className="text-zinc-200 text-base font-semibold flex items-center gap-2">
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
                                ? "border-amber-500 bg-amber-500/10"
                                : "border-zinc-700 hover:border-amber-500/50 bg-zinc-800"
                            }`}
                          >
                            <img
                              src={getServiceIcon(service.id) || "/assets/default.png"}
                              alt={service.name}
                              className="h-12 w-12 mx-auto mb-2"
                            />
                            <p className="text-sm font-medium text-zinc-200">{service.name}</p>
                            {!isLinked && (
                              <Badge variant="outline" className="absolute top-2 right-2 text-xs text-zinc-400 border-zinc-600">
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
                <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <img
                    src={getServiceIcon(selectedActionService.id) || "/assets/default.png"}
                    alt={selectedActionService.name}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-semibold text-white">{selectedActionService.name} Actions</p>
                    <p className="text-sm text-zinc-400">Choose what triggers this automation</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedActionService.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionSelect(action)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedAction?.id === action.id
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-zinc-700 hover:border-amber-500/50 bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{action.name}</p>
                          <p className="text-sm text-zinc-400 mt-1">{action.description}</p>
                        </div>
                        {selectedAction?.id === action.id && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Selected</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedAction && selectedAction.parameters.length > 0 && (
                  <div className="mt-6 space-y-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <h4 className="font-semibold text-white">Configure Parameters</h4>
                    {selectedAction.parameters.map((param) =>
                      renderParameterInput(
                        param,
                        actionParams[param.name],
                        (key, val) => setActionParams({ ...actionParams, [key]: val }),
                        "action",
                        undefined,
                        selectedActionService?.id
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select Reaction */}
            {currentStep === 3 && selectedReactionService && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <img
                    src={getServiceIcon(selectedReactionService.id) || "/assets/default.png"}
                    alt={selectedReactionService.name}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-semibold text-white">{selectedReactionService.name} Reactions</p>
                    <p className="text-sm text-zinc-400">Choose what happens when triggered</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedReactionService.reactions.map((reaction) => (
                    <button
                      key={reaction.id}
                      onClick={() => handleReactionSelect(reaction)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedReaction?.id === reaction.id
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-zinc-700 hover:border-amber-500/50 bg-zinc-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{reaction.name}</p>
                          <p className="text-sm text-zinc-400 mt-1">{reaction.description}</p>
                        </div>
                        {selectedReaction?.id === reaction.id && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Selected</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedReaction && selectedReaction.parameters.length > 0 && (
                  <div className="mt-6 space-y-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <h4 className="font-semibold text-white">Configure Parameters</h4>
                    {(() => {
                      const actionVariables = selectedAction?.return_values || [];

                      console.log("Variables detected:", actionVariables);

                      return selectedReaction.parameters.map((param) =>
                        renderParameterInput(
                          param,
                          reactionParams[param.name],
                          (key, val) => setReactionParams({ ...reactionParams, [key]: val }),
                          "reaction",
                          actionVariables,
                          selectedReactionService?.id
                        )
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-orange-500/10 rounded-lg border border-zinc-700 space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {areaName}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-400">WHEN</p>
                        <p className="font-semibold text-white">{selectedAction?.name}</p>
                        <p className="text-sm text-zinc-400">{selectedAction?.description}</p>
                        {Object.keys(actionParams).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(actionParams).map(([key, value]) => (
                              <p key={key} className="text-xs text-zinc-500">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-400">THEN</p>
                        <p className="font-semibold text-white">{selectedReaction?.name}</p>
                        <p className="text-sm text-zinc-400">{selectedReaction?.description}</p>
                        {Object.keys(reactionParams).length > 0 && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(reactionParams).map(([key, value]) => (
                              <p key={key} className="text-xs text-zinc-500">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <Check className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-200">
                    Your AREA will be created as <strong>active</strong> and will start working immediately.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  Cancel
                </Button>
              </div>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-medium hover:from-amber-500 hover:to-orange-600"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  {loading ? "Creating..." : "Create AREA"}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Not Linked Modal */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <LinkIcon className="h-5 w-5 text-amber-400" />
              Link Your {modalService} Account
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              You need to link your {modalService} account to use this service in your AREAs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-400">
              Linking your account allows AREA to perform actions on your behalf using {modalService}.
              You'll be redirected to {modalService} to authorize the connection.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAccountModal(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button onClick={handleLinkAccount} className="bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:from-amber-500 hover:to-orange-600">
              <LinkIcon className="h-4 w-4 mr-2" />
              Link Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Missing Permissions Modal */}
      <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Additional Permissions Required
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              This {modalType} requires additional permissions from your {modalService} account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-zinc-400 mb-3">
              The following permissions are needed:
            </p>
            <ul className="space-y-2">
              {modalScopes.map((scope) => (
                <li key={scope} className="text-xs bg-zinc-800 border border-zinc-700 p-2 rounded font-mono text-zinc-300">
                  {scope}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionModal(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button onClick={handleRequestPermissions} className="bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:from-amber-500 hover:to-orange-600">
              Grant Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
