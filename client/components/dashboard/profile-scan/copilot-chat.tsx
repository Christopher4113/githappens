"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

interface ShopperProfile {
  type: string
  traits: number[]
  confidence: number
  signals: string[]
  incentive: string
}

interface CopilotChatProps {
  currentProfile: ShopperProfile
  previousProfileType?: string
}

const SUGGESTED_PROMPTS = [
  "Why is this shopper classified this way?",
  "What incentive should we show?",
  "How confident is the model?",
  "What signals led to this?",
]

// Response generator based on current profile
function generateResponse(question: string, profile: ShopperProfile): string {
  const lowerQuestion = question.toLowerCase()

  // Classification questions
  if (lowerQuestion.includes("classified") || lowerQuestion.includes("why") || lowerQuestion.includes("type")) {
    const responses: Record<string, string> = {
      Researcher: `This shopper is classified as a Researcher because they exhibit high research depth (${profile.traits[2]}%) and strong engagement patterns (${profile.traits[4]}%). Key indicators include ${profile.signals.slice(0, 2).join(" and ").toLowerCase()}. Researchers typically need comprehensive information before converting.`,
      "Price-Sensitive": `This shopper is classified as Price-Sensitive due to elevated price sensitivity (${profile.traits[1]}%) and hesitancy signals (${profile.traits[0]}%). We detected ${profile.signals[0].toLowerCase()} and ${profile.signals[1].toLowerCase()}, which are hallmark behaviors of value-focused shoppers.`,
      Hesitant: `This shopper shows Hesitant behavior with a ${profile.traits[0]}% hesitancy score and lower decision speed (${profile.traits[3]}%). The signals—${profile.signals.join(", ").toLowerCase()}—suggest they need reassurance before committing.`,
      Decisive: `This shopper is Decisive with ${profile.traits[3]}% decision speed and ${profile.traits[4]}% engagement. Their behavior shows ${profile.signals[0].toLowerCase()} and ${profile.signals[1].toLowerCase()}. These shoppers convert quickly when friction is minimized.`,
      Browser: `This shopper is classified as a Browser based on balanced trait scores and exploratory behavior. We see ${profile.signals[0].toLowerCase()} and ${profile.signals[1].toLowerCase()}. Browsers often return later to purchase if nurtured correctly.`,
    }
    return (
      responses[profile.type] ||
      `This shopper displays ${profile.type} characteristics based on their behavioral patterns.`
    )
  }

  // Incentive questions
  if (lowerQuestion.includes("incentive") || lowerQuestion.includes("offer") || lowerQuestion.includes("should we")) {
    const incentiveReasons: Record<string, string> = {
      Researcher: `For Researchers, I recommend "${profile.incentive}". This gives them time to complete their comparison process without pressure. Adding a comparison tool or detailed specs panel would also increase conversion likelihood by 23%.`,
      "Price-Sensitive": `"${profile.incentive}" is optimal here. Price-sensitive shoppers respond well to perceived savings. Consider showing the discount prominently and adding a "you save" badge. This typically lifts conversion by 31%.`,
      Hesitant: `"${profile.incentive}" addresses the core anxiety. Hesitant shoppers fear regret—removing that risk with easy returns typically increases conversion by 28%. Consider adding trust badges near the CTA.`,
      Decisive: `"${profile.incentive}" works best for Decisive shoppers. They value speed and efficiency. Reducing checkout steps and highlighting fast delivery can boost their already high intent by 15%.`,
      Browser: `For Browsers, "${profile.incentive}" creates urgency without pressure. Offering early access to sales or new arrivals keeps them engaged and increases return visit probability by 40%.`,
    }
    return (
      incentiveReasons[profile.type] ||
      `The recommended incentive is "${profile.incentive}" based on this shopper's profile.`
    )
  }

  // Confidence questions
  if (lowerQuestion.includes("confident") || lowerQuestion.includes("accuracy") || lowerQuestion.includes("sure")) {
    return `The model confidence for this ${profile.type} classification is ${profile.confidence}%. This is based on ${profile.signals.length} behavioral signals analyzed over the session. Confidence above 85% indicates strong pattern matching with historical ${profile.type} shoppers.`
  }

  // Signal questions
  if (lowerQuestion.includes("signal") || lowerQuestion.includes("behavior") || lowerQuestion.includes("indicator")) {
    return `Key signals detected:\n\n• ${profile.signals.join("\n• ")}\n\nThese behaviors were weighted against our training data of 50K+ shopper sessions. The combination pattern strongly correlates with ${profile.type} shoppers (r=0.${Math.floor(profile.confidence * 0.95)}).`
  }

  // Default response
  return `Based on the current ${profile.type} profile (${profile.confidence}% confidence), I'm seeing ${profile.signals[0].toLowerCase()} as the primary signal. The recommended action is "${profile.incentive}". Would you like me to explain the reasoning behind this classification?`
}

export function CopilotChat({ currentProfile, previousProfileType }: CopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [pinnedProfile, setPinnedProfile] = useState<ShopperProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeProfile = isPinned && pinnedProfile ? pinnedProfile : currentProfile

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Show profile change notification
  useEffect(() => {
    if (previousProfileType && previousProfileType !== currentProfile.type && !isPinned) {
      const systemMessage: Message = {
        role: "system",
        content: `Shopper changed: ${previousProfileType} → ${currentProfile.type}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, systemMessage])
    }
  }, [currentProfile.type, previousProfileType, isPinned])

  // Pin profile when user starts typing
  useEffect(() => {
    if (inputValue && !isPinned) {
      setIsPinned(true)
      setPinnedProfile(currentProfile)
    }
  }, [inputValue, isPinned, currentProfile])

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400))

    const response = generateResponse(text, activeProfile)
    const assistantMessage: Message = {
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)

    // Unpin after response
    setIsPinned(false)
    setPinnedProfile(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputValue)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-foreground">Copilot</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isTyping ? "bg-yellow-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="text-xs text-muted-foreground">{isTyping ? "Analyzing" : "Online"}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ask questions about the current shopper profile and recommended action.
        </p>
        {isPinned && (
          <div className="mt-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400">
            Profile pinned: {pinnedProfile?.type}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-400/50" />
            <p>Start a conversation about the</p>
            <p className="font-medium text-foreground">{currentProfile.type} shopper</p>
          </div>
        )}

        {messages.map((message, i) => (
          <div key={i}>
            {message.role === "system" ? (
              <div className="flex justify-center">
                <div className="px-3 py-1.5 bg-muted/50 rounded-full text-xs text-muted-foreground">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-purple-500/20 text-foreground rounded-br-md"
                      : "bg-muted/50 text-foreground/90 rounded-bl-md border border-border/30"
                  }`}
                  style={{
                    boxShadow: message.role === "assistant" ? "0 0 20px rgba(139, 92, 246, 0.05)" : undefined,
                  }}
                >
                  {message.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 bg-muted/50 rounded-2xl rounded-bl-md border border-border/30">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full border border-border/50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this shopper…"
            className="flex-1 bg-muted/30 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20"
          />
          <Button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
